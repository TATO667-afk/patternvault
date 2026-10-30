-- ModuleScript: ServerScriptService/MutationLab/CurrencyManager
-- Server-side currency (Mutagen) tracking with client sync.

local CM = {}
local RS = game:GetService("ReplicatedStorage")
local CurrencyUpdate = RS:WaitForChild("MutationLab"):WaitForChild("CurrencyUpdate")
local balances = {}
function CM.init(player, amount)
	balances[player] = amount
	CurrencyUpdate:FireClient(player, amount)
end
function CM.get(player)
	return balances[player] or 0
end
function CM.add(player, amount)
	balances[player] = (balances[player] or 0) + amount
	CurrencyUpdate:FireClient(player, balances[player])
	return balances[player]
end
function CM.deduct(player, amount)
	local cur = balances[player] or 0
	if cur < amount then return false end
	balances[player] = cur - amount
	CurrencyUpdate:FireClient(player, balances[player])
	return true
end
function CM.cleanup(player)
	balances[player] = nil
end
return CM
