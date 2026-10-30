-- Script: ServerScriptService/MutationLab/IncomeManager
-- Awards passive Mutagen income every INCOME_INTERVAL seconds
-- based on creatures placed in display slots.

local Players = game:GetService("Players")
local RS = game:GetService("ReplicatedStorage")
local SSS = game:GetService("ServerScriptService")
local mlFolder = RS:WaitForChild("MutationLab")
local Config = require(mlFolder:WaitForChild("Config"))
local CM = require(SSS:WaitForChild("MutationLab"):WaitForChild("CurrencyManager"))
local IM = require(SSS:WaitForChild("MutationLab"):WaitForChild("InventoryManager"))
local IncomeNotify = mlFolder:WaitForChild("IncomeNotify")
local INTERVAL = Config.INCOME_INTERVAL

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
			CM.add(player, total)
			IncomeNotify:FireClient(player, total)
		end
	end
end
