-- ModuleScript: ServerScriptService/MutationLab/InventoryManager
-- Server-side creature inventory tracking per player.

local IM = {}
local RS = game:GetService("ReplicatedStorage")
local mlFolder = RS:WaitForChild("MutationLab")
local InventoryUpdate = mlFolder:WaitForChild("InventoryUpdate")
local inventories = {}

function IM.init(player)
	inventories[player] = {}
end

function IM.addCreature(player, data)
	local inv = inventories[player]
	if not inv then return end
	table.insert(inv, {
		id = data.id,
		name = data.name,
		rarity = data.rarity,
		rarityIndex = data.rarityIndex,
		color = data.color,
		seed = data.seed,
		income = data.income,
		slotIndex = data.slotIndex,
	})
	IM.sync(player)
end

function IM.getCreature(player, creatureId)
	local inv = inventories[player]
	if not inv then return nil end
	for _, c in ipairs(inv) do
		if c.id == creatureId then return c end
	end
	return nil
end

function IM.setSlot(player, creatureId, slotIndex)
	local c = IM.getCreature(player, creatureId)
	if c then
		c.slotIndex = slotIndex
		IM.sync(player)
	end
end

function IM.clearSlot(player, creatureId)
	local c = IM.getCreature(player, creatureId)
	if not c then return nil end
	local oldSlot = c.slotIndex
	c.slotIndex = nil
	IM.sync(player)
	return oldSlot
end

function IM.getSlottedCreatures(player)
	local result = {}
	local inv = inventories[player]
	if not inv then return result end
	for _, c in ipairs(inv) do
		if c.slotIndex then
			table.insert(result, c)
		end
	end
	return result
end

function IM.sync(player)
	local inv = inventories[player]
	if not inv then return end
	local data = {}
	for _, c in ipairs(inv) do
		table.insert(data, {
			id = c.id,
			name = c.name,
			rarity = c.rarity,
			rarityIndex = c.rarityIndex,
			income = c.income,
			slotIndex = c.slotIndex,
		})
	end
	InventoryUpdate:FireClient(player, data)
end

function IM.cleanup(player)
	inventories[player] = nil
end

return IM
