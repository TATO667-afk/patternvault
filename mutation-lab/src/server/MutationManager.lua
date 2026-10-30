-- Script: ServerScriptService/MutationLab/MutationManager
-- Handles mutation machine interaction, server-authoritative rolls,
-- creature generation, placement, and slot management requests.
-- Phase 4: applies speed multiplier, luck bonus, upgraded max slots.

local Players = game:GetService("Players")
local RS = game:GetService("ReplicatedStorage")
local SSS = game:GetService("ServerScriptService")
local mlFolder = RS:WaitForChild("MutationLab")
local Config = require(mlFolder:WaitForChild("Config"))
local CreatureData = require(mlFolder:WaitForChild("CreatureData"))
local CreatureBuilder = require(mlFolder:WaitForChild("CreatureBuilder"))
local CM = require(SSS:WaitForChild("MutationLab"):WaitForChild("CurrencyManager"))
local IM = require(SSS:WaitForChild("MutationLab"):WaitForChild("InventoryManager"))
local MutationStart = mlFolder:WaitForChild("MutationStart")
local MutationResult = mlFolder:WaitForChild("MutationResult")
local PlaceRequest = mlFolder:WaitForChild("PlaceRequest")
local RemoveRequest = mlFolder:WaitForChild("RemoveRequest")
local plotsFolder = workspace:WaitForChild("MutationLab"):WaitForChild("Plots")
local cooldowns = {}
local mutating = {}
local COST = Config.MUTATION_COST
local CD = Config.MUTATION_COOLDOWN

local function getUM()
	return _G.MutationLabUpgrades
end

local function rollRarity(player)
	local UM = getUM()
	local luckBonus = UM and UM.getLuckBonus(player) or 0

	local weights = {}
	for i, r in ipairs(Config.RARITY) do
		weights[i] = r.weight
	end
	if luckBonus > 0 and weights[1] > 100 then
		local shift = math.min(luckBonus, weights[1] - 100)
		weights[1] = weights[1] - shift
		local perRarity = shift / (#weights - 1)
		for i = 2, #weights do
			weights[i] = weights[i] + perRarity
		end
	end

	local total = 0
	for i = 1, #weights do total = total + weights[i] end
	local roll = math.random(1, math.floor(total))
	local cum = 0
	for i = 1, #weights do
		cum = cum + weights[i]
		if roll <= cum then return i, Config.RARITY[i] end
	end
	return 1, Config.RARITY[1]
end

local function genCreature(ri, rInfo)
	local seed = math.random(1, 999999)
	return {
		id = tostring(seed) .. "_" .. tostring(tick()),
		name = CreatureData.generateName(seed),
		rarity = rInfo.name,
		rarityIndex = ri,
		color = rInfo.color,
		seed = seed,
		income = Config.INCOME_PER_RARITY[ri],
	}
end

local function findSlot(plotModel, player)
	local UM = getUM()
	local maxSlots = UM and UM.getMaxSlots(player) or Config.MAX_SLOTS
	for si = 1, maxSlots do
		local slot = plotModel:FindFirstChild("Slot_" .. si)
		if slot and not slot:FindFirstChildOfClass("Model") then
			return si, slot
		end
	end
	return nil, nil
end

local function getPlayerPlot(player)
	for i = 1, Config.NUM_PLOTS do
		local plot = plotsFolder:FindFirstChild("Plot_" .. i)
		if plot and plot:GetAttribute("OwnerId") == player.UserId then
			return plot
		end
	end
	return nil
end

local function getPlotFromPrompt(prompt)
	local cur = prompt.Parent
	while cur and cur ~= workspace do
		if cur.Name:match("^Plot_%d+$") then return cur end
		cur = cur.Parent
	end
	return nil
end

local function placeCreatureModel(cData, slot, rInfo)
	local creature = CreatureBuilder.build(cData)
	creature:PivotTo(slot.CFrame + Vector3.new(0, 1.5, 0))
	creature.Parent = slot
	slot.Color = rInfo.color
	slot.Transparency = 0.3
	return creature
end

local function resetSlot(slot)
	for _, child in ipairs(slot:GetChildren()) do
		if child:IsA("Model") then child:Destroy() end
	end
	slot.Color = Color3.fromRGB(0, 200, 120)
	slot.Transparency = 0.6
end

local function handleMutation(player, prompt)
	local plotModel = getPlotFromPrompt(prompt)
	if not plotModel then return end
	if plotModel:GetAttribute("OwnerId") ~= player.UserId then return end
	if mutating[player] then return end
	if cooldowns[player] and tick() - cooldowns[player] < CD then return end
	if not CM.deduct(player, COST) then return end

	mutating[player] = true
	cooldowns[player] = tick()
	prompt.Enabled = false

	local ri, rInfo = rollRarity(player)
	local cData = genCreature(ri, rInfo)
	local plotIdx = tonumber(plotModel.Name:match("%d+"))

	local UM = getUM()
	local speedMult = UM and UM.getSpeedMultiplier(player) or 1
	local DUR = Config.MUTATION_DURATION * speedMult

	MutationStart:FireClient(player, plotIdx, DUR)

	task.delay(DUR, function()
		local si, slot = findSlot(plotModel, player)
		local slotted = false
		if slot then
			placeCreatureModel(cData, slot, rInfo)
			cData.slotIndex = si
			slotted = true
		end
		IM.addCreature(player, cData)
		MutationResult:FireClient(player, {
			id = cData.id,
			name = cData.name,
			rarity = cData.rarity,
			rarityIndex = cData.rarityIndex,
			income = cData.income,
			slotted = slotted,
		}, plotIdx)
		mutating[player] = false
		prompt.Enabled = true
	end)
end

task.defer(function()
	for i = 1, Config.NUM_PLOTS do
		local plot = plotsFolder:WaitForChild("Plot_" .. i, 10)
		if plot then
			local machine = plot:WaitForChild("MutationMachine", 5)
			if machine then
				for _, d in ipairs(machine:GetDescendants()) do
					if d:IsA("ProximityPrompt") then
						d.Triggered:Connect(function(plr)
							handleMutation(plr, d)
						end)
						break
					end
				end
			end
		end
	end
	print("[MutationManager] All machines connected")
end)

PlaceRequest.OnServerEvent:Connect(function(player, creatureId, targetSlot)
	local plotModel = getPlayerPlot(player)
	if not plotModel then return end
	local creature = IM.getCreature(player, creatureId)
	if not creature then return end
	if creature.slotIndex then return end
	local UM = getUM()
	local maxSlots = UM and UM.getMaxSlots(player) or Config.MAX_SLOTS
	local si, slot
	if targetSlot and type(targetSlot) == "number"
		and targetSlot >= 1 and targetSlot <= maxSlots then
		slot = plotModel:FindFirstChild("Slot_" .. targetSlot)
		if slot and not slot:FindFirstChildOfClass("Model") then
			si = targetSlot
		end
	end
	if not si then
		si, slot = findSlot(plotModel, player)
	end
	if not si or not slot then return end
	local rInfo = Config.RARITY[creature.rarityIndex]
	if not rInfo then return end
	placeCreatureModel(creature, slot, rInfo)
	IM.setSlot(player, creatureId, si)
end)

RemoveRequest.OnServerEvent:Connect(function(player, creatureId)
	local plotModel = getPlayerPlot(player)
	if not plotModel then return end
	local creature = IM.getCreature(player, creatureId)
	if not creature then return end
	if not creature.slotIndex then return end
	local slot = plotModel:FindFirstChild("Slot_" .. creature.slotIndex)
	if slot then resetSlot(slot) end
	IM.clearSlot(player, creatureId)
end)

Players.PlayerAdded:Connect(function(player)
	IM.init(player)
	CM.init(player, Config.STARTER_CURRENCY)
end)
Players.PlayerRemoving:Connect(function(player)
	mutating[player] = nil
	cooldowns[player] = nil
	IM.cleanup(player)
	CM.cleanup(player)
end)
