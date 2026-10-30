-- Script: ServerScriptService/MutationLab/IncomeManager
-- Awards passive Mutagen income every INCOME_INTERVAL seconds
-- based on creatures placed in display slots.
-- Phase 4: applies income multiplier from upgrades.

local Players = game:GetService("Players")
local RS = game:GetService("ReplicatedStorage")
local SSS = game:GetService("ServerScriptService")
local mlFolder = RS:WaitForChild("MutationLab")
local Config = require(mlFolder:WaitForChild("Config"))
local CM = require(SSS:WaitForChild("MutationLab"):WaitForChild("CurrencyManager"))
local IM = require(SSS:WaitForChild("MutationLab"):WaitForChild("InventoryManager"))
local IncomeNotify = mlFolder:WaitForChild("IncomeNotify")
local INTERVAL = Config.INCOME_INTERVAL

local function getUM()
	return _G.MutationLabUpgrades
end

print("[IncomeManager] Started, interval=" .. INTERVAL .. "s")

while true do
	task.wait(INTERVAL)
	for _, player in ipairs(Players:GetPlayers()) do
		local slotted = IM.getSlottedCreatures(player)
		local total = 0
		for _, c in ipairs(slotted) do
			total = total + (c.income or 0)
		end
		if total > 0 then
			local UM = getUM()
			local mult = UM and UM.getIncomeMultiplier(player) or 1
			local finalIncome = math.floor(total * mult)
			if finalIncome > 0 then
				CM.add(player, finalIncome)
				IncomeNotify:FireClient(player, finalIncome)
			end
		end
	end
end
