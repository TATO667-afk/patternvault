-- ================================================================
-- MUTATION LAB  —  PHASE 4 INSTALLER
-- ================================================================
-- Adds: Lab upgrades (speed, slots, income multiplier, luck),
--       upgrade terminal with UI, visual upgrade indicators.
-- Requires Phase 1, 2, and 3 already installed. Safe to re-run.
-- Paste into Command Bar and press Enter.
-- ================================================================

print("[MutationLab] Phase 4 installer starting...")

local WS  = game:GetService("Workspace")
local SSS = game:GetService("ServerScriptService")
local RS  = game:GetService("ReplicatedStorage")
local SP  = game:GetService("StarterPlayer")
local SPS = SP:FindFirstChild("StarterPlayerScripts")

-- Validate Phase 1 + 2 + 3
local mlRoot = WS:FindFirstChild("MutationLab")
local rsFolder = RS:FindFirstChild("MutationLab")
local sssFolder = SSS:FindFirstChild("MutationLab")
local spsFolder = SPS and SPS:FindFirstChild("MutationLab")

if not mlRoot or not rsFolder or not sssFolder then
	error("[MutationLab] Phase 1 not found! Run Phase1_Installer first.")
end
if not rsFolder:FindFirstChild("CreatureBuilder") then
	error("[MutationLab] Phase 2 not found! Run Phase2_Installer first.")
end
if not sssFolder:FindFirstChild("InventoryManager") then
	error("[MutationLab] Phase 3 not found! Run Phase3_Installer first.")
end

local plotsFolder = mlRoot:FindFirstChild("Plots")
if not plotsFolder then
	error("[MutationLab] Plots folder missing!")
end

-- ================================================================
--  CLEANUP PHASE 4 CONTENT (for re-runs)
-- ================================================================
print("[MutationLab] Cleaning previous Phase 4...")

-- Remove upgrade terminals from plots
for i = 1, 8 do
	local plot = plotsFolder:FindFirstChild("Plot_" .. i)
	if plot then
		local term = plot:FindFirstChild("UpgradeTerminal")
		if term then term:Destroy() end
	end
end

local p4sss = {"UpgradeManager"}
for _, name in ipairs(p4sss) do
	local item = sssFolder:FindFirstChild(name)
	if item then item:Destroy() end
end
local p4events = {"UpgradeRequest", "UpgradeUpdate"}
for _, name in ipairs(p4events) do
	local item = rsFolder:FindFirstChild(name)
	if item then item:Destroy() end
end
if spsFolder then
	local ug = spsFolder:FindFirstChild("UpgradeUI")
	if ug then ug:Destroy() end
end

-- ================================================================
--  CREATE REMOTE EVENTS
-- ================================================================
print("[MutationLab] Creating Phase 4 events...")
local function makeEvent(name)
	local e = Instance.new("RemoteEvent")
	e.Name = name; e.Parent = rsFolder; return e
end
makeEvent("UpgradeRequest")
makeEvent("UpgradeUpdate")

-- ================================================================
--  UPDATE CONFIG
-- ================================================================
print("[MutationLab] Updating Config...")
local configMS = rsFolder:FindFirstChild("Config")
if configMS then
	configMS.Source = [=[
local Config = {}
Config.NUM_PLOTS = 8
Config.MAX_PLAYERS = 8
Config.RARITY = {
	{name="Common",    weight=550, color=Color3.fromRGB(200,200,200)},
	{name="Rare",      weight=250, color=Color3.fromRGB(0,150,255)},
	{name="Epic",      weight=120, color=Color3.fromRGB(180,0,255)},
	{name="Legendary", weight=60,  color=Color3.fromRGB(255,200,0)},
	{name="Mythic",    weight=18,  color=Color3.fromRGB(255,50,50)},
	{name="Secret",    weight=2,   color=Color3.fromRGB(255,255,255)},
}
Config.STARTER_CURRENCY = 100
Config.CURRENCY_NAME = "Mutagen"
Config.MUTATION_COST = 50
Config.MUTATION_DURATION = 5
Config.MUTATION_COOLDOWN = 6
Config.INCOME_PER_RARITY = {1, 3, 8, 20, 50, 150}
Config.INCOME_INTERVAL = 10
Config.MAX_SLOTS = 6
Config.PLOT_RADIUS = 160
Config.PLOT_SIZE = 64
Config.BASE_Y = 10

-- Upgrades: {name, description, maxLevel, baseCost, costMultiplier, icon}
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
]=]
end

-- ================================================================
--  BUILD UPGRADE TERMINALS IN PLOTS
-- ================================================================
print("[MutationLab] Building upgrade terminals...")

local TC = {
	base   = Color3.fromRGB(30, 32, 44),
	screen = Color3.fromRGB(8, 8, 16),
	accent = Color3.fromRGB(160, 40, 255),
	glow   = Color3.fromRGB(140, 60, 255),
}

local function mpart(parent, name, size, cf, color, opts)
	local p = Instance.new("Part")
	p.Name = name; p.Anchored = true; p.Size = size; p.CFrame = cf
	p.Color = color; p.Material = Enum.Material.SmoothPlastic
	p.TopSurface = Enum.SurfaceType.Smooth
	p.BottomSurface = Enum.SurfaceType.Smooth
	if opts then
		if opts.neon then p.Material = Enum.Material.Neon end
		if opts.t and opts.t > 0 then p.Transparency = opts.t end
		if opts.cc ~= nil then p.CanCollide = opts.cc end
	end
	p.Parent = parent
	return p
end

local function buildTerminal(plotModel, plotIndex)
	local spawn = plotModel:FindFirstChild("PlotSpawn")
	if not spawn then
		warn("[MutationLab] No PlotSpawn in Plot_" .. plotIndex)
		return
	end

	-- Place terminal on the left wall side, offset from center
	local plotCF = spawn.CFrame
	local termCF = plotCF * CFrame.new(-12, 0, -8)

	local terminal = Instance.new("Model")
	terminal.Name = "UpgradeTerminal"

	-- Base stand
	local base = mpart(terminal, "Base",
		Vector3.new(3, 3, 1.5), termCF * CFrame.new(0, 1.5, 0), TC.base)
	terminal.PrimaryPart = base

	-- Screen
	local screen = mpart(terminal, "Screen",
		Vector3.new(2.6, 2, 0.15),
		termCF * CFrame.new(0, 2.8, -0.7) * CFrame.Angles(math.rad(-10), 0, 0),
		TC.screen)

	-- Screen SurfaceGui
	local sg = Instance.new("SurfaceGui")
	sg.Face = Enum.NormalId.Front
	sg.LightInfluence = 0; sg.Parent = screen

	local screenTitle = Instance.new("TextLabel")
	screenTitle.Name = "Title"
	screenTitle.Size = UDim2.new(1, 0, 0.4, 0)
	screenTitle.BackgroundTransparency = 1
	screenTitle.TextColor3 = TC.accent
	screenTitle.Font = Enum.Font.GothamBold
	screenTitle.TextScaled = true
	screenTitle.Text = "UPGRADES"
	screenTitle.Parent = sg

	local screenSub = Instance.new("TextLabel")
	screenSub.Name = "Sub"
	screenSub.Size = UDim2.new(1, 0, 0.3, 0)
	screenSub.Position = UDim2.new(0, 0, 0.45, 0)
	screenSub.BackgroundTransparency = 1
	screenSub.TextColor3 = Color3.fromRGB(160, 180, 200)
	screenSub.Font = Enum.Font.Gotham
	screenSub.TextScaled = true
	screenSub.Text = "Press E to open"
	screenSub.Parent = sg

	-- Neon accent strip
	mpart(terminal, "AccentStrip",
		Vector3.new(2.8, 0.15, 0.15),
		termCF * CFrame.new(0, 1.7, -0.8),
		TC.accent, {neon = true})

	-- Neon top bar
	mpart(terminal, "TopBar",
		Vector3.new(2.8, 0.1, 0.15),
		termCF * CFrame.new(0, 3.9, -0.65),
		TC.glow, {neon = true})

	-- Point light
	local pl = Instance.new("PointLight")
	pl.Color = TC.accent; pl.Brightness = 0.8; pl.Range = 12
	pl.Parent = screen

	-- ProximityPrompt
	local prompt = Instance.new("ProximityPrompt")
	prompt.ObjectText = "Upgrade Terminal"
	prompt.ActionText = "Upgrades"
	prompt.HoldDuration = 0.3
	prompt.MaxActivationDistance = 10
	prompt.RequiresLineOfSight = false
	prompt.Parent = screen

	terminal.Parent = plotModel
	print("[MutationLab]   Terminal built in Plot " .. plotIndex)
end

for i = 1, 8 do
	local plot = plotsFolder:FindFirstChild("Plot_" .. i)
	if plot then buildTerminal(plot, i) end
end

-- ================================================================
--  CREATE UPGRADE MANAGER SCRIPT
-- ================================================================
print("[MutationLab] Creating UpgradeManager...")
local umScript = Instance.new("Script")
umScript.Name = "UpgradeManager"
umScript.Source = [=[
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

-- Apply upgrade effects
local function getSpeedMultiplier(player)
	local lvl = getLevel(player, "speed")
	return 1 - (lvl * 0.12) -- 12% faster per level: 5s -> 4.4 -> 3.8 -> 3.2 -> 2.6 -> 2.0
end

local function getMaxSlots(player)
	return Config.MAX_SLOTS + getLevel(player, "slots")
end

local function getIncomeMultiplier(player)
	local lvl = getLevel(player, "income")
	return 1 + (lvl * 0.3) -- +30% per level: 1.0 -> 1.3 -> 1.6 -> 1.9 -> 2.2 -> 2.5
end

local function getLuckBonus(player)
	local lvl = getLevel(player, "luck")
	return lvl * 12 -- shifts 12 weight from Common to higher rarities per level
end

-- Handle upgrade purchase
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

	-- Handle slots upgrade: create new slot Parts in the plot
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
						-- Position new slots behind existing ones
						local row = math.ceil((newSlotNum - 1) / 3)
						local col = ((newSlotNum - 1) % 3)
						local plotSpawn = plot:FindFirstChild("PlotSpawn")
						if plotSpawn then
							local baseCF = plotSpawn.CFrame
							newSlot.CFrame = baseCF * CFrame.new(-8 + col * 8, -1.5, 4 + row * 6)
						end
						newSlot.Color = Color3.fromRGB(0, 200, 120)
						newSlot.Transparency = 0.6
						-- Remove any child models from cloned slot
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

-- Expose getters for other scripts
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

-- Store module on script for access by other scripts
script:SetAttribute("Ready", false)
local umModule = Instance.new("ModuleScript")
umModule.Name = "UpgradeData"
umModule.Source = "return nil" -- placeholder
umModule.Parent = script

-- We'll expose via shared table approach instead
-- Store in _G for cross-script access (common Roblox pattern)
_G.MutationLabUpgrades = UM

Players.PlayerAdded:Connect(function(player)
	initUpgrades(player)
end)
Players.PlayerRemoving:Connect(function(player)
	playerUpgrades[player] = nil
end)

-- Init for players already in game (re-run safety)
for _, player in ipairs(Players:GetPlayers()) do
	if not playerUpgrades[player] then
		initUpgrades(player)
	end
end

script:SetAttribute("Ready", true)
print("[UpgradeManager] Ready")
]=]
umScript.Parent = sssFolder

-- ================================================================
--  UPDATE MUTATION MANAGER (apply speed + luck upgrades)
-- ================================================================
print("[MutationLab] Updating MutationManager...")
local mmScript = sssFolder:FindFirstChild("MutationManager")
if mmScript then
	mmScript.Source = [=[
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

	-- Build modified weights
	local weights = {}
	for i, r in ipairs(Config.RARITY) do
		weights[i] = r.weight
	end
	-- Shift weight from Common to higher rarities
	if luckBonus > 0 and weights[1] > 100 then
		local shift = math.min(luckBonus, weights[1] - 100)
		weights[1] = weights[1] - shift
		-- Distribute to higher rarities
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

	-- Apply speed upgrade
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

-- Handle slot placement (respects upgraded slot count)
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

-- Handle slot removal
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
]=]
end

-- ================================================================
--  UPDATE INCOME MANAGER (apply income multiplier)
-- ================================================================
print("[MutationLab] Updating IncomeManager...")
local incScript = sssFolder:FindFirstChild("IncomeManager")
if incScript then
	incScript.Source = [=[
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
]=]
end

-- ================================================================
--  CREATE UPGRADE UI
-- ================================================================
print("[MutationLab] Creating UpgradeUI...")
if spsFolder then
	local ugScript = Instance.new("LocalScript")
	ugScript.Name = "UpgradeUI"
	ugScript.Source = [=[
local Players = game:GetService("Players")
local TS = game:GetService("TweenService")
local RS = game:GetService("ReplicatedStorage")
local player = Players.LocalPlayer
local pGui = player:WaitForChild("PlayerGui")
local ml = RS:WaitForChild("MutationLab")
local UpgradeRequest = ml:WaitForChild("UpgradeRequest")
local UpgradeUpdate = ml:WaitForChild("UpgradeUpdate")

local upgrades = {}

local gui = Instance.new("ScreenGui")
gui.Name="UpgradeUI"; gui.ResetOnSpawn=false
gui.ZIndexBehavior=Enum.ZIndexBehavior.Sibling; gui.Parent=pGui

----------------------------------------------------------------
-- Panel (center, hidden by default)
----------------------------------------------------------------
local overlay = Instance.new("Frame")
overlay.Name="Overlay"
overlay.Size=UDim2.new(1,0,1,0)
overlay.BackgroundColor3=Color3.new(0,0,0)
overlay.BackgroundTransparency=0.5
overlay.BorderSizePixel=0
overlay.Visible=false; overlay.Parent=gui

local panel = Instance.new("Frame")
panel.Name="UpgradePanel"
panel.Size=UDim2.new(0,340,0,380)
panel.Position=UDim2.new(0.5,-170,0.5,-190)
panel.BackgroundColor3=Color3.fromRGB(14,14,28)
panel.BorderSizePixel=0; panel.Parent=overlay
Instance.new("UICorner",panel).CornerRadius=UDim.new(0,12)
local pStroke=Instance.new("UIStroke")
pStroke.Color=Color3.fromRGB(160,40,255); pStroke.Thickness=2; pStroke.Parent=panel

-- Header
local header = Instance.new("Frame")
header.Size=UDim2.new(1,0,0,44)
header.BackgroundColor3=Color3.fromRGB(24,20,42)
header.BorderSizePixel=0; header.Parent=panel
Instance.new("UICorner",header).CornerRadius=UDim.new(0,12)

local hdrText = Instance.new("TextLabel")
hdrText.Size=UDim2.new(1,-44,1,0); hdrText.Position=UDim2.new(0,12,0,0)
hdrText.BackgroundTransparency=1; hdrText.TextColor3=Color3.fromRGB(160,40,255)
hdrText.Font=Enum.Font.GothamBold; hdrText.TextSize=17
hdrText.TextXAlignment=Enum.TextXAlignment.Left
hdrText.Text="LAB UPGRADES"; hdrText.Parent=header

local closeBtn = Instance.new("TextButton")
closeBtn.Size=UDim2.new(0,30,0,30); closeBtn.Position=UDim2.new(1,-37,0,7)
closeBtn.BackgroundColor3=Color3.fromRGB(160,40,40)
closeBtn.BorderSizePixel=0; closeBtn.TextColor3=Color3.new(1,1,1)
closeBtn.Font=Enum.Font.GothamBold; closeBtn.TextSize=14
closeBtn.Text="X"; closeBtn.Parent=header
Instance.new("UICorner",closeBtn).CornerRadius=UDim.new(0,6)

-- Scroll area
local scroll = Instance.new("ScrollingFrame")
scroll.Size=UDim2.new(1,-12,1,-54)
scroll.Position=UDim2.new(0,6,0,48)
scroll.BackgroundTransparency=1
scroll.ScrollBarThickness=4
scroll.ScrollBarImageColor3=Color3.fromRGB(160,40,255)
scroll.BorderSizePixel=0
scroll.CanvasSize=UDim2.new(0,0,0,0)
scroll.Parent=panel

local layout = Instance.new("UIListLayout")
layout.SortOrder=Enum.SortOrder.LayoutOrder
layout.Padding=UDim.new(0,6); layout.Parent=scroll

layout:GetPropertyChangedSignal("AbsoluteContentSize"):Connect(function()
	scroll.CanvasSize=UDim2.new(0,0,0,layout.AbsoluteContentSize.Y+8)
end)

----------------------------------------------------------------
-- Toggle
----------------------------------------------------------------
local function showPanel()
	overlay.Visible = true
	panel.Size = UDim2.new(0,10,0,10)
	panel.Position = UDim2.new(0.5,-5,0.5,-5)
	TS:Create(panel,TweenInfo.new(0.3,Enum.EasingStyle.Back),{
		Size=UDim2.new(0,340,0,380),
		Position=UDim2.new(0.5,-170,0.5,-190),
	}):Play()
end

local function hidePanel()
	TS:Create(panel,TweenInfo.new(0.2,Enum.EasingStyle.Quad,Enum.EasingDirection.In),{
		Size=UDim2.new(0,10,0,10),
		Position=UDim2.new(0.5,-5,0.5,-5),
	}):Play()
	task.delay(0.25, function()
		overlay.Visible = false
	end)
end

closeBtn.MouseButton1Click:Connect(hidePanel)
overlay.InputBegan:Connect(function(input)
	if input.UserInputType == Enum.UserInputType.MouseButton1
		or input.UserInputType == Enum.UserInputType.Touch then
		-- Only close if clicking the overlay background
		local pos = input.Position
		local pAbs = panel.AbsolutePosition
		local pSz = panel.AbsoluteSize
		if pos.X < pAbs.X or pos.X > pAbs.X + pSz.X
			or pos.Y < pAbs.Y or pos.Y > pAbs.Y + pSz.Y then
			hidePanel()
		end
	end
end)

----------------------------------------------------------------
-- Card builder
----------------------------------------------------------------
local function createUpgradeCard(uData, order)
	local card = Instance.new("Frame")
	card.Size=UDim2.new(1,-8,0,74)
	card.BackgroundColor3=Color3.fromRGB(26,24,44)
	card.BorderSizePixel=0
	card.LayoutOrder=order; card.Parent=scroll
	Instance.new("UICorner",card).CornerRadius=UDim.new(0,8)
	local cs=Instance.new("UIStroke")
	cs.Color=Color3.fromRGB(60,50,90); cs.Thickness=1; cs.Parent=card

	-- Icon
	local icon = Instance.new("TextLabel")
	icon.Size=UDim2.new(0,36,0,36); icon.Position=UDim2.new(0,8,0,8)
	icon.BackgroundColor3=Color3.fromRGB(40,36,64)
	icon.BorderSizePixel=0
	icon.TextColor3=Color3.new(1,1,1)
	icon.Font=Enum.Font.GothamBold; icon.TextSize=20
	icon.Text=uData.icon or "?"; icon.Parent=card
	Instance.new("UICorner",icon).CornerRadius=UDim.new(0,8)

	-- Name
	local nm = Instance.new("TextLabel")
	nm.Size=UDim2.new(1,-130,0,20); nm.Position=UDim2.new(0,52,0,6)
	nm.BackgroundTransparency=1
	nm.TextColor3=Color3.fromRGB(220,200,255)
	nm.Font=Enum.Font.GothamBold; nm.TextSize=13
	nm.TextXAlignment=Enum.TextXAlignment.Left
	nm.Text=uData.name; nm.Parent=card

	-- Description + level
	local desc = Instance.new("TextLabel")
	desc.Size=UDim2.new(1,-130,0,16); desc.Position=UDim2.new(0,52,0,26)
	desc.BackgroundTransparency=1
	desc.TextColor3=Color3.fromRGB(140,130,170)
	desc.Font=Enum.Font.Gotham; desc.TextSize=11
	desc.TextXAlignment=Enum.TextXAlignment.Left
	desc.Text=uData.desc; desc.Parent=card

	-- Level bar
	local barBg = Instance.new("Frame")
	barBg.Size=UDim2.new(1,-120,0,8); barBg.Position=UDim2.new(0,52,0,46)
	barBg.BackgroundColor3=Color3.fromRGB(30,28,50)
	barBg.BorderSizePixel=0; barBg.Parent=card
	Instance.new("UICorner",barBg).CornerRadius=UDim.new(0,4)

	local barFill = Instance.new("Frame")
	local fillPct = uData.maxLevel > 0 and (uData.level / uData.maxLevel) or 0
	barFill.Size=UDim2.new(fillPct,0,1,0)
	barFill.BackgroundColor3=Color3.fromRGB(160,40,255)
	barFill.BorderSizePixel=0; barFill.Parent=barBg
	Instance.new("UICorner",barFill).CornerRadius=UDim.new(0,4)

	local lvlText = Instance.new("TextLabel")
	lvlText.Size=UDim2.new(0,50,0,16); lvlText.Position=UDim2.new(1,-58,0,44)
	lvlText.BackgroundTransparency=1
	lvlText.TextColor3=Color3.fromRGB(160,40,255)
	lvlText.Font=Enum.Font.GothamBold; lvlText.TextSize=11
	lvlText.Text="Lv " .. uData.level .. "/" .. uData.maxLevel
	lvlText.Parent=card

	-- Buy button
	local btn = Instance.new("TextButton")
	btn.Size=UDim2.new(0,72,0,30); btn.Position=UDim2.new(1,-80,0,8)
	btn.BorderSizePixel=0
	btn.Font=Enum.Font.GothamBold; btn.TextSize=12
	btn.Parent=card
	Instance.new("UICorner",btn).CornerRadius=UDim.new(0,6)

	if uData.maxed then
		btn.Text="MAXED"
		btn.BackgroundColor3=Color3.fromRGB(60,50,90)
		btn.TextColor3=Color3.fromRGB(140,130,170)
	else
		btn.Text=tostring(uData.cost)
		btn.BackgroundColor3=Color3.fromRGB(120,30,200)
		btn.TextColor3=Color3.new(1,1,1)
		btn.MouseButton1Click:Connect(function()
			UpgradeRequest:FireServer(uData.id)
		end)
	end

	return card
end

local function refreshUI()
	for _, child in ipairs(scroll:GetChildren()) do
		if child:IsA("Frame") then child:Destroy() end
	end
	for i, u in ipairs(upgrades) do
		createUpgradeCard(u, i)
	end
end

----------------------------------------------------------------
-- Listen
----------------------------------------------------------------
UpgradeUpdate.OnClientEvent:Connect(function(data)
	upgrades = data or {}
	refreshUI()
end)

-- Connect terminal prompts
task.defer(function()
	local plotsFld = workspace:WaitForChild("MutationLab"):WaitForChild("Plots")
	for i = 1, 8 do
		local plot = plotsFld:FindFirstChild("Plot_" .. i)
		if plot then
			local terminal = plot:FindFirstChild("UpgradeTerminal")
			if terminal then
				for _, d in ipairs(terminal:GetDescendants()) do
					if d:IsA("ProximityPrompt") then
						d.Triggered:Connect(function()
							if overlay.Visible then
								hidePanel()
							else
								showPanel()
							end
						end)
						break
					end
				end
			end
		end
	end
end)
]=]
	ugScript.Parent = spsFolder
end

-- ================================================================
--  DONE
-- ================================================================
print("========================================")
print("[MutationLab] Phase 4 installed!")
print("  Upgrade Terminals .. 8")
print("  New Scripts ........ UpgradeManager, UpgradeUI")
print("  Updated Scripts .... Config, MutationManager,")
print("                       IncomeManager")
print("  New Events ......... UpgradeRequest, UpgradeUpdate")
print("========================================")
print("Press F5 to test!")
print("  - Walk to the purple Upgrade Terminal in your lab")
print("  - Press E to open the upgrade panel")
print("  - Buy upgrades: Speed, Slots, Income, Luck")
print("  - Each upgrade has 4-5 levels with increasing costs")
