-- Script: ServerScriptService/MutationLab/UpgradeManager
-- Handles lab upgrade purchases, applies effects, exposes getters
-- for other scripts via _G.MutationLabUpgrades.

local Players = game:GetService("Players")
local RS = game:GetService("ReplicatedStorage")
local SSS = game:GetService("ServerScriptService")
local mlFolder = RS:WaitForChild("MutationLab")
local Config = require(mlFolder:WaitForChild("Config"))
local CM = require(SSS:WaitForChild("MutationLab"):WaitForChild("CurrencyManager"))
local UpgradeRequest = mlFolder:WaitForChild("UpgradeRequest")
local UpgradeUpdate = mlFolder:WaitForChild("UpgradeUpdate")
local plotsFolder = workspace:WaitForChild("MutationLab"):WaitForChild("Plots")

local playerUpgrades = {} -- player -> {speed=0, slots=0, income=0, luck=0}

local syncUpgrades -- forward declaration

local function initUpgrades(player)
	playerUpgrades[player] = {}
	for _, u in ipairs(Config.UPGRADES) do
		playerUpgrades[player][u.id] = 0
	end
	syncUpgrades(player)
end

syncUpgrades = function(player)
	local data = playerUpgrades[player]
	if not data then return end
	local send = {}
	for i, u in ipairs(Config.UPGRADES) do
		local lvl = data[u.id] or 0
		table.insert(send, {
			id = u.id,
			name = u.name,
			desc = u.desc,
			icon = u.icon,
			level = lvl,
			maxLevel = u.maxLevel,
			cost = lvl < u.maxLevel and Config.getUpgradeCost(i, lvl) or 0,
			maxed = lvl >= u.maxLevel,
		})
	end
	UpgradeUpdate:FireClient(player, send)
end

local function getLevel(player, upgradeId)
	local data = playerUpgrades[player]
	if not data then return 0 end
	return data[upgradeId] or 0
end

local function getSpeedMultiplier(player)
	local lvl = getLevel(player, "speed")
	return 1 - (lvl * 0.12)
end

local function getMaxSlots(player)
	return Config.MAX_SLOTS + getLevel(player, "slots")
end

local function getIncomeMultiplier(player)
	local lvl = getLevel(player, "income")
	return 1 + (lvl * 0.3)
end

local function getLuckBonus(player)
	local lvl = getLevel(player, "luck")
	return lvl * 12
end

UpgradeRequest.OnServerEvent:Connect(function(player, upgradeId)
	local data = playerUpgrades[player]
	if not data then return end
	if type(upgradeId) ~= "string" then return end

	local uIndex = nil
	for i, u in ipairs(Config.UPGRADES) do
		if u.id == upgradeId then uIndex = i; break end
	end
	if not uIndex then return end

	local u = Config.UPGRADES[uIndex]
	local currentLevel = data[upgradeId] or 0
	if currentLevel >= u.maxLevel then return end

	local cost = Config.getUpgradeCost(uIndex, currentLevel)
	if not CM.deduct(player, cost) then return end

	data[upgradeId] = currentLevel + 1
	print("[UpgradeManager] " .. player.Name .. " upgraded " .. upgradeId .. " to level " .. data[upgradeId])

	if upgradeId == "slots" then
		local newSlotNum = Config.MAX_SLOTS + data[upgradeId]
		for pi = 1, Config.NUM_PLOTS do
			local plot = plotsFolder:FindFirstChild("Plot_" .. pi)
			if plot and plot:GetAttribute("OwnerId") == player.UserId then
				local existing = plot:FindFirstChild("Slot_" .. newSlotNum)
				if not existing then
					local slot1 = plot:FindFirstChild("Slot_1")
					if slot1 then
						local newSlot = slot1:Clone()
						newSlot.Name = "Slot_" .. newSlotNum
						local row = math.ceil((newSlotNum - 1) / 3)
						local col = ((newSlotNum - 1) % 3)
						local plotSpawn = plot:FindFirstChild("PlotSpawn")
						if plotSpawn then
							local baseCF = plotSpawn.CFrame
							newSlot.CFrame = baseCF * CFrame.new(-8 + col * 8, -1.5, 4 + row * 6)
						end
						newSlot.Color = Color3.fromRGB(0, 200, 120)
						newSlot.Transparency = 0.6
						for _, child in ipairs(newSlot:GetChildren()) do
							if child:IsA("Model") then child:Destroy() end
						end
						newSlot.Parent = plot
					end
				end
				break
			end
		end
	end

	syncUpgrades(player)
end)

local UM = {}
UM.getSpeedMultiplier = getSpeedMultiplier
UM.getMaxSlots = getMaxSlots
UM.getIncomeMultiplier = getIncomeMultiplier
UM.getLuckBonus = getLuckBonus
UM.getLevel = getLevel
UM.syncUpgrades = syncUpgrades
UM.initUpgrades = initUpgrades
UM.cleanup = function(player)
	playerUpgrades[player] = nil
end

_G.MutationLabUpgrades = UM

Players.PlayerAdded:Connect(function(player)
	initUpgrades(player)
end)
Players.PlayerRemoving:Connect(function(player)
	playerUpgrades[player] = nil
end)

for _, player in ipairs(Players:GetPlayers()) do
	if not playerUpgrades[player] then
		initUpgrades(player)
	end
end

script:SetAttribute("Ready", true)
print("[UpgradeManager] Ready")
