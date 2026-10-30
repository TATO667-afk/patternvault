-- ModuleScript: ReplicatedStorage/MutationLab/Config
-- Shared game configuration. All tuning values live here.

local Config = {}

Config.NUM_PLOTS = 8
Config.MAX_PLAYERS = 8

-- Rarity table (weights out of 1000)
Config.RARITY = {
	{ name = "Common",    weight = 550, color = Color3.fromRGB(200, 200, 200) },
	{ name = "Rare",      weight = 250, color = Color3.fromRGB(0, 150, 255) },
	{ name = "Epic",      weight = 120, color = Color3.fromRGB(180, 0, 255) },
	{ name = "Legendary", weight = 60,  color = Color3.fromRGB(255, 200, 0) },
	{ name = "Mythic",    weight = 18,  color = Color3.fromRGB(255, 50, 50) },
	{ name = "Secret",    weight = 2,   color = Color3.fromRGB(255, 255, 255) },
}

Config.STARTER_CURRENCY = 100
Config.CURRENCY_NAME = "Mutagen"
Config.MUTATION_COST = 50
Config.MUTATION_DURATION = 5
Config.MUTATION_COOLDOWN = 6
Config.INCOME_PER_RARITY = {1, 3, 8, 20, 50, 150}
Config.INCOME_INTERVAL = 10
Config.MAX_SLOTS = 6

-- Layout
Config.PLOT_RADIUS = 160
Config.PLOT_SIZE = 64
Config.BASE_Y = 10

-- Upgrades: {id, name, desc, maxLevel, baseCost, costMultiplier, icon}
Config.UPGRADES = {
	{
		id = "speed",
		name = "Mutation Speed",
		desc = "Reduces mutation time",
		maxLevel = 5,
		baseCost = 100,
		costMult = 2.0,
		icon = "⚡",
	},
	{
		id = "slots",
		name = "Extra Slots",
		desc = "Adds display slots (+1 per level)",
		maxLevel = 4,
		baseCost = 200,
		costMult = 2.5,
		icon = "📦",
	},
	{
		id = "income",
		name = "Income Boost",
		desc = "Multiplies passive income",
		maxLevel = 5,
		baseCost = 150,
		costMult = 2.2,
		icon = "💰",
	},
	{
		id = "luck",
		name = "Lucky Mutagen",
		desc = "Better rarity chances",
		maxLevel = 5,
		baseCost = 250,
		costMult = 2.5,
		icon = "🍀",
	},
}

function Config.getUpgradeCost(upgradeIndex, currentLevel)
	local u = Config.UPGRADES[upgradeIndex]
	if not u then return 999999 end
	return math.floor(u.baseCost * (u.costMult ^ currentLevel))
end

return Config
