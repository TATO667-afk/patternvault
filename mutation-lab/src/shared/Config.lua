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

-- Layout
Config.PLOT_RADIUS = 160
Config.PLOT_SIZE = 64
Config.BASE_Y = 10

return Config
