-- Script: ServerScriptService/MutationLab/MutationManager
-- Handles mutation machine interaction, server-authoritative rolls,
-- creature generation, placement, and slot management requests.

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
local DUR = Config.MUTATION_DURATION
local CD = Config.MUTATION_COOLDOWN

local function rollRarity()
	local total = 0
	for _, r in ipairs(Config.RARITY) do total = total + r.weight end
	local roll = math.random(1, total)
	local cum = 0
	for i, r in ipairs(Config.RARITY) do
		cum = cum + r.weight
		if roll <= cum then return i, r end
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

local function findSlot(plotModel)
	for si = 1, Config.MAX_SLOTS do
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

	local ri, rInfo = rollRarity()
	local cData = genCreature(ri, rInfo)
	local plotIdx = tonumber(plotModel.Name:match("%d+"))

	MutationStart:FireClient(player, plotIdx, DUR)

	task.delay(DUR, function()
		local si, slot = findSlot(plotModel)
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

-- Connect all machines
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

-- Handle slot placement requests
PlaceRequest.OnServerEvent:Connect(function(player, creatureId, targetSlot)
	local plotModel = getPlayerPlot(player)
	if not plotModel then return end
	local creature = IM.getCreature(player, creatureId)
	if not creature then return end
	if creature.slotIndex then return end
	local si, slot
	if targetSlot and type(targetSlot) == "number"
		and targetSlot >= 1 and targetSlot <= Config.MAX_SLOTS then
		slot = plotModel:FindFirstChild("Slot_" .. targetSlot)
		if slot and not slot:FindFirstChildOfClass("Model") then
			si = targetSlot
		end
	end
	if not si then
		si, slot = findSlot(plotModel)
	end
	if not si or not slot then return end
	local rInfo = Config.RARITY[creature.rarityIndex]
	if not rInfo then return end
	placeCreatureModel(creature, slot, rInfo)
	IM.setSlot(player, creatureId, si)
end)

-- Handle slot removal requests
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

-- Init
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
