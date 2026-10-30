-- ================================================================
-- MUTATION LAB  —  PHASE 3 INSTALLER
-- ================================================================
-- Adds: Creature inventory UI, slot placement/removal,
--       passive income system, income notifications.
-- Requires Phase 1 and Phase 2 already installed. Safe to re-run.
-- Paste into Command Bar and press Enter.
-- ================================================================

print("[MutationLab] Phase 3 installer starting...")

local WS  = game:GetService("Workspace")
local SSS = game:GetService("ServerScriptService")
local RS  = game:GetService("ReplicatedStorage")
local SP  = game:GetService("StarterPlayer")
local SPS = SP:FindFirstChild("StarterPlayerScripts")

-- Validate Phase 1 + 2
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

local plotsFolder = mlRoot:FindFirstChild("Plots")
if not plotsFolder then
	error("[MutationLab] Plots folder missing!")
end

-- ================================================================
--  CLEANUP PHASE 3 CONTENT (for re-runs)
-- ================================================================
print("[MutationLab] Cleaning previous Phase 3...")

local p3sss = {"InventoryManager", "IncomeManager"}
for _, name in ipairs(p3sss) do
	local item = sssFolder:FindFirstChild(name)
	if item then item:Destroy() end
end
local p3events = {"InventoryUpdate", "PlaceRequest", "RemoveRequest", "IncomeNotify"}
for _, name in ipairs(p3events) do
	local item = rsFolder:FindFirstChild(name)
	if item then item:Destroy() end
end
if spsFolder then
	local invUI = spsFolder:FindFirstChild("InventoryUI")
	if invUI then invUI:Destroy() end
end

-- ================================================================
--  CREATE REMOTE EVENTS
-- ================================================================
print("[MutationLab] Creating Phase 3 events...")
local function makeEvent(name)
	local e = Instance.new("RemoteEvent")
	e.Name = name; e.Parent = rsFolder; return e
end
makeEvent("InventoryUpdate")
makeEvent("PlaceRequest")
makeEvent("RemoveRequest")
makeEvent("IncomeNotify")

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
return Config
]=]
end

-- ================================================================
--  CREATE INVENTORY MANAGER MODULE
-- ================================================================
print("[MutationLab] Creating InventoryManager...")
local imMS = Instance.new("ModuleScript")
imMS.Name = "InventoryManager"
imMS.Source = [=[
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
]=]
imMS.Parent = sssFolder

-- ================================================================
--  CREATE INCOME MANAGER SCRIPT
-- ================================================================
print("[MutationLab] Creating IncomeManager...")
local incScript = Instance.new("Script")
incScript.Name = "IncomeManager"
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
]=]
incScript.Parent = sssFolder

-- ================================================================
--  UPDATE MUTATION MANAGER (inventory integration + slot handling)
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
]=]
end

-- ================================================================
--  UPDATE PLOT UI (add income float notification)
-- ================================================================
print("[MutationLab] Updating PlotUI...")
local plotUI = spsFolder and spsFolder:FindFirstChild("PlotUI")
if plotUI then
	plotUI.Source = [=[
local Players = game:GetService("Players")
local TS = game:GetService("TweenService")
local RS = game:GetService("ReplicatedStorage")
local player = Players.LocalPlayer
local pGui = player:WaitForChild("PlayerGui")
local ml = RS:WaitForChild("MutationLab")
local PlotAssigned = ml:WaitForChild("PlotAssigned")
local CurrencyUpdate = ml:WaitForChild("CurrencyUpdate")
local IncomeNotify = ml:WaitForChild("IncomeNotify")

local gui = Instance.new("ScreenGui")
gui.Name="PlotUI"; gui.ResetOnSpawn=false
gui.ZIndexBehavior=Enum.ZIndexBehavior.Sibling; gui.Parent=pGui

-- HUD Bar
local hud = Instance.new("Frame")
hud.Name="HUD"; hud.Size=UDim2.new(0,260,0,34)
hud.Position=UDim2.new(0,8,0,8)
hud.BackgroundColor3=Color3.fromRGB(12,12,22)
hud.BackgroundTransparency=0.2; hud.BorderSizePixel=0
hud.Visible=false; hud.Parent=gui
Instance.new("UICorner",hud).CornerRadius=UDim.new(0,8)
local hs=Instance.new("UIStroke"); hs.Color=Color3.fromRGB(0,200,100)
hs.Thickness=1; hs.Parent=hud

local labLabel = Instance.new("TextLabel")
labLabel.Size=UDim2.new(0,80,1,0); labLabel.Position=UDim2.new(0,8,0,0)
labLabel.BackgroundTransparency=1; labLabel.TextColor3=Color3.fromRGB(0,255,120)
labLabel.Font=Enum.Font.GothamBold; labLabel.TextSize=14
labLabel.TextXAlignment=Enum.TextXAlignment.Left; labLabel.Text=""
labLabel.Parent=hud

local currLabel = Instance.new("TextLabel")
currLabel.Size=UDim2.new(0,150,1,0)
currLabel.Position=UDim2.new(1,-158,0,0)
currLabel.BackgroundTransparency=1; currLabel.TextColor3=Color3.fromRGB(0,230,110)
currLabel.Font=Enum.Font.GothamBold; currLabel.TextSize=14
currLabel.TextXAlignment=Enum.TextXAlignment.Right; currLabel.Text="Mutagen: ---"
currLabel.Parent=hud

-- Banner
local banner = Instance.new("Frame")
banner.Name="Banner"; banner.Size=UDim2.new(0,340,0,52)
banner.Position=UDim2.new(0.5,-170,0,-56)
banner.BackgroundColor3=Color3.fromRGB(12,12,22)
banner.BorderSizePixel=0; banner.Parent=gui
Instance.new("UICorner",banner).CornerRadius=UDim.new(0,10)
local bsk=Instance.new("UIStroke"); bsk.Color=Color3.fromRGB(0,255,120)
bsk.Thickness=2; bsk.Parent=banner
local bGrad=Instance.new("UIGradient")
bGrad.Color=ColorSequence.new(Color3.fromRGB(0,255,120),Color3.fromRGB(0,180,255))
bGrad.Parent=bsk
local bText=Instance.new("TextLabel")
bText.Name="Text"; bText.Size=UDim2.new(1,-20,1,0)
bText.Position=UDim2.new(0,10,0,0); bText.BackgroundTransparency=1
bText.TextColor3=Color3.fromRGB(0,255,120); bText.Font=Enum.Font.GothamBold
bText.TextSize=18; bText.Text=""; bText.Parent=banner

local function showBanner(text)
	bText.Text=text; banner.Position=UDim2.new(0.5,-170,0,-56)
	TS:Create(banner,TweenInfo.new(0.5,Enum.EasingStyle.Back,Enum.EasingDirection.Out),
		{Position=UDim2.new(0.5,-170,0,14)}):Play()
	task.delay(3.5,function()
		TS:Create(banner,TweenInfo.new(0.3,Enum.EasingStyle.Quad,Enum.EasingDirection.In),
			{Position=UDim2.new(0.5,-170,0,-56)}):Play()
	end)
end

PlotAssigned.OnClientEvent:Connect(function(idx)
	showBanner("Assigned to Lab " .. idx)
	hud.Visible=true; labLabel.Text="Lab " .. idx
end)

CurrencyUpdate.OnClientEvent:Connect(function(amount)
	currLabel.Text="Mutagen: " .. tostring(amount)
	currLabel.TextColor3=Color3.fromRGB(100,255,180)
	TS:Create(currLabel,TweenInfo.new(0.4),{TextColor3=Color3.fromRGB(0,230,110)}):Play()
end)

-- Income float notification
IncomeNotify.OnClientEvent:Connect(function(amount)
	local float = Instance.new("TextLabel")
	float.Size=UDim2.new(0,120,0,24)
	float.Position=UDim2.new(1,-140,0,-8)
	float.BackgroundTransparency=1
	float.TextColor3=Color3.fromRGB(0,255,120)
	float.Font=Enum.Font.GothamBold; float.TextSize=16
	float.TextXAlignment=Enum.TextXAlignment.Right
	float.Text="+" .. amount .. " Mutagen"
	float.Parent=hud
	TS:Create(float,TweenInfo.new(1.8,Enum.EasingStyle.Quad,Enum.EasingDirection.Out),
		{Position=UDim2.new(1,-140,0,-36), TextTransparency=1}):Play()
	task.delay(2,function()
		if float.Parent then float:Destroy() end
	end)
end)
]=]
end

-- ================================================================
--  UPDATE MUTATION CLIENT (handle slotted field + no-slot message)
-- ================================================================
print("[MutationLab] Updating MutationClient...")
local mcScript = spsFolder and spsFolder:FindFirstChild("MutationClient")
if mcScript then
	mcScript.Source = [=[
local TS = game:GetService("TweenService")
local RS = game:GetService("ReplicatedStorage")
local ml = RS:WaitForChild("MutationLab")
local Config = require(ml:WaitForChild("Config"))
local MutationStart = ml:WaitForChild("MutationStart")
local MutationResult = ml:WaitForChild("MutationResult")
local plotsFolder = workspace:WaitForChild("MutationLab"):WaitForChild("Plots")

local RARITY_COLORS = {}
for i, r in ipairs(Config.RARITY) do
	RARITY_COLORS[i] = r.color
end

MutationStart.OnClientEvent:Connect(function(plotIdx, duration)
	local plot = plotsFolder:FindFirstChild("Plot_" .. plotIdx)
	if not plot then return end
	local machine = plot:FindFirstChild("MutationMachine")
	if not machine then return end
	local cg = machine:FindFirstChild("ChamberGlow")
	local pe = nil
	for _, d in ipairs(machine:GetDescendants()) do
		if d:IsA("ParticleEmitter") then pe = d; break end
	end
	if pe then pe.Enabled = true; pe.Rate = 40 end
	if not cg then return end
	task.spawn(function()
		local speed = 0.35
		local elapsed = 0
		local ci = 1
		while elapsed < duration - 0.3 do
			TS:Create(cg, TweenInfo.new(speed*0.7), {
				Color = RARITY_COLORS[ci],
				Transparency = 0.15 + math.sin(elapsed*4)*0.1
			}):Play()
			task.wait(speed)
			elapsed = elapsed + speed
			ci = (ci % #RARITY_COLORS) + 1
			speed = math.max(0.06, speed * 0.87)
		end
	end)
end)

MutationResult.OnClientEvent:Connect(function(cData, plotIdx)
	local plot = plotsFolder:FindFirstChild("Plot_" .. plotIdx)
	if not plot then return end
	local machine = plot:FindFirstChild("MutationMachine")
	if not machine then return end
	local cg = machine:FindFirstChild("ChamberGlow")
	for _, d in ipairs(machine:GetDescendants()) do
		if d:IsA("ParticleEmitter") then d.Enabled = false end
	end
	local color = RARITY_COLORS[cData.rarityIndex] or Color3.new(1,1,1)
	if cg then
		cg.Color = color; cg.Transparency = 0
		TS:Create(cg, TweenInfo.new(2), {Transparency = 0.5}):Play()
	end
	-- Rarity reveal billboard
	local anchor = machine:FindFirstChild("TopCap") or machine:FindFirstChild("Base")
	if not anchor then return end
	local old = anchor:FindFirstChild("RarityReveal")
	if old then old:Destroy() end
	local bb = Instance.new("BillboardGui")
	bb.Name="RarityReveal"; bb.Size=UDim2.new(0,10,0,4)
	bb.StudsOffset=Vector3.new(0,3,0); bb.AlwaysOnTop=true
	bb.Parent=anchor

	local rl = Instance.new("TextLabel")
	rl.Size=UDim2.new(1,0,0.4,0); rl.BackgroundTransparency=1
	rl.TextColor3=color; rl.Font=Enum.Font.GothamBold
	rl.TextScaled=true; rl.Text=string.upper(cData.rarity)
	rl.TextStrokeTransparency=0; rl.TextStrokeColor3=Color3.new(0,0,0)
	rl.Parent=bb

	local nl = Instance.new("TextLabel")
	nl.Size=UDim2.new(1,0,0.3,0); nl.Position=UDim2.new(0,0,0.42,0)
	nl.BackgroundTransparency=1; nl.TextColor3=Color3.fromRGB(230,230,230)
	nl.Font=Enum.Font.Gotham; nl.TextScaled=true; nl.Text=cData.name
	nl.TextStrokeTransparency=0; nl.TextStrokeColor3=Color3.new(0,0,0)
	nl.Parent=bb

	-- No-slot warning
	if cData.slotted == false then
		local wl = Instance.new("TextLabel")
		wl.Size=UDim2.new(1,0,0.22,0); wl.Position=UDim2.new(0,0,0.75,0)
		wl.BackgroundTransparency=1
		wl.TextColor3=Color3.fromRGB(255,200,50)
		wl.Font=Enum.Font.Gotham; wl.TextScaled=true
		wl.Text="Open Inventory to place!"
		wl.TextStrokeTransparency=0; wl.TextStrokeColor3=Color3.new(0,0,0)
		wl.Parent=bb
	end

	-- Pop-in
	TS:Create(bb,TweenInfo.new(0.4,Enum.EasingStyle.Back),
		{Size=UDim2.new(0,220,0,100)}):Play()
	-- Fade out
	task.delay(4, function()
		if not bb.Parent then return end
		for _, label in ipairs(bb:GetDescendants()) do
			if label:IsA("TextLabel") then
				TS:Create(label,TweenInfo.new(0.5),
					{TextTransparency=1,TextStrokeTransparency=1}):Play()
			end
		end
		task.wait(0.6)
		if bb.Parent then bb:Destroy() end
	end)
end)
]=]
end

-- ================================================================
--  CREATE INVENTORY UI
-- ================================================================
print("[MutationLab] Creating InventoryUI...")
if spsFolder then
	local invScript = Instance.new("LocalScript")
	invScript.Name = "InventoryUI"
	invScript.Source = [=[
local Players = game:GetService("Players")
local TS = game:GetService("TweenService")
local RS = game:GetService("ReplicatedStorage")
local player = Players.LocalPlayer
local pGui = player:WaitForChild("PlayerGui")
local ml = RS:WaitForChild("MutationLab")
local Config = require(ml:WaitForChild("Config"))
local InventoryUpdate = ml:WaitForChild("InventoryUpdate")
local PlaceRequest = ml:WaitForChild("PlaceRequest")
local RemoveRequest = ml:WaitForChild("RemoveRequest")

local COLORS = {}
for i, r in ipairs(Config.RARITY) do
	COLORS[i] = r.color
end

local inventory = {}

local gui = Instance.new("ScreenGui")
gui.Name="InventoryUI"; gui.ResetOnSpawn=false
gui.ZIndexBehavior=Enum.ZIndexBehavior.Sibling; gui.Parent=pGui

----------------------------------------------------------------
-- Toggle Button (below HUD bar)
----------------------------------------------------------------
local toggleBtn = Instance.new("TextButton")
toggleBtn.Name="InvToggle"
toggleBtn.Size=UDim2.new(0,140,0,28)
toggleBtn.Position=UDim2.new(0,8,0,48)
toggleBtn.BackgroundColor3=Color3.fromRGB(12,12,22)
toggleBtn.BackgroundTransparency=0.15
toggleBtn.BorderSizePixel=0
toggleBtn.TextColor3=Color3.fromRGB(0,230,120)
toggleBtn.Font=Enum.Font.GothamBold; toggleBtn.TextSize=13
toggleBtn.Text="Inventory (0)"
toggleBtn.Visible=false; toggleBtn.Parent=gui
Instance.new("UICorner",toggleBtn).CornerRadius=UDim.new(0,6)
local tbs=Instance.new("UIStroke")
tbs.Color=Color3.fromRGB(0,180,100); tbs.Thickness=1; tbs.Parent=toggleBtn

----------------------------------------------------------------
-- Panel (right side, slides in/out)
----------------------------------------------------------------
local panel = Instance.new("Frame")
panel.Name="InvPanel"
panel.Size=UDim2.new(0,280,0.85,0)
panel.Position=UDim2.new(1,10,0.075,0)
panel.BackgroundColor3=Color3.fromRGB(14,14,26)
panel.BackgroundTransparency=0.05
panel.BorderSizePixel=0; panel.Parent=gui
Instance.new("UICorner",panel).CornerRadius=UDim.new(0,10)
local pStroke=Instance.new("UIStroke")
pStroke.Color=Color3.fromRGB(0,200,120); pStroke.Thickness=2; pStroke.Parent=panel

-- Header
local header = Instance.new("Frame")
header.Size=UDim2.new(1,0,0,40)
header.BackgroundColor3=Color3.fromRGB(20,20,36)
header.BorderSizePixel=0; header.Parent=panel
Instance.new("UICorner",header).CornerRadius=UDim.new(0,10)

local hdrText = Instance.new("TextLabel")
hdrText.Size=UDim2.new(1,-44,1,0); hdrText.Position=UDim2.new(0,10,0,0)
hdrText.BackgroundTransparency=1; hdrText.TextColor3=Color3.fromRGB(0,255,120)
hdrText.Font=Enum.Font.GothamBold; hdrText.TextSize=15
hdrText.TextXAlignment=Enum.TextXAlignment.Left
hdrText.Text="INVENTORY"; hdrText.Parent=header

local closeBtn = Instance.new("TextButton")
closeBtn.Size=UDim2.new(0,28,0,28); closeBtn.Position=UDim2.new(1,-34,0,6)
closeBtn.BackgroundColor3=Color3.fromRGB(160,40,40)
closeBtn.BorderSizePixel=0; closeBtn.TextColor3=Color3.new(1,1,1)
closeBtn.Font=Enum.Font.GothamBold; closeBtn.TextSize=14
closeBtn.Text="X"; closeBtn.Parent=header
Instance.new("UICorner",closeBtn).CornerRadius=UDim.new(0,6)

-- Income rate label
local incLabel = Instance.new("TextLabel")
incLabel.Size=UDim2.new(1,-20,0,20)
incLabel.Position=UDim2.new(0,10,0,44)
incLabel.BackgroundTransparency=1
incLabel.TextColor3=Color3.fromRGB(0,200,100)
incLabel.Font=Enum.Font.Gotham; incLabel.TextSize=12
incLabel.TextXAlignment=Enum.TextXAlignment.Left
incLabel.Text="Income: +0 every 10s"; incLabel.Parent=panel

-- Scroll frame
local scroll = Instance.new("ScrollingFrame")
scroll.Size=UDim2.new(1,-10,1,-74)
scroll.Position=UDim2.new(0,5,0,68)
scroll.BackgroundTransparency=1
scroll.ScrollBarThickness=4
scroll.ScrollBarImageColor3=Color3.fromRGB(0,200,120)
scroll.BorderSizePixel=0
scroll.CanvasSize=UDim2.new(0,0,0,0)
scroll.Parent=panel

local layout = Instance.new("UIListLayout")
layout.SortOrder=Enum.SortOrder.LayoutOrder
layout.Padding=UDim.new(0,4); layout.Parent=scroll

layout:GetPropertyChangedSignal("AbsoluteContentSize"):Connect(function()
	scroll.CanvasSize = UDim2.new(0,0,0,layout.AbsoluteContentSize.Y+8)
end)

----------------------------------------------------------------
-- Panel toggle
----------------------------------------------------------------
local panelOpen = false
local function togglePanel()
	panelOpen = not panelOpen
	local target
	if panelOpen then
		target = UDim2.new(1,-290,0.075,0)
	else
		target = UDim2.new(1,10,0.075,0)
	end
	TS:Create(panel,TweenInfo.new(0.3,Enum.EasingStyle.Quad,Enum.EasingDirection.Out),
		{Position=target}):Play()
end

toggleBtn.MouseButton1Click:Connect(togglePanel)
closeBtn.MouseButton1Click:Connect(function()
	if panelOpen then togglePanel() end
end)

----------------------------------------------------------------
-- Card builder
----------------------------------------------------------------
local function createCard(cData, order)
	local card = Instance.new("Frame")
	card.Name="Card_" .. (cData.id or "")
	card.Size=UDim2.new(1,-6,0,62)
	card.BackgroundColor3=Color3.fromRGB(22,22,38)
	card.BorderSizePixel=0
	card.LayoutOrder=order; card.Parent=scroll
	Instance.new("UICorner",card).CornerRadius=UDim.new(0,6)

	-- Rarity color bar
	local bar = Instance.new("Frame")
	bar.Size=UDim2.new(0,4,1,-6); bar.Position=UDim2.new(0,3,0,3)
	bar.BackgroundColor3=COLORS[cData.rarityIndex] or Color3.new(0.5,0.5,0.5)
	bar.BorderSizePixel=0; bar.Parent=card
	Instance.new("UICorner",bar).CornerRadius=UDim.new(0,2)

	-- Name
	local nm = Instance.new("TextLabel")
	nm.Size=UDim2.new(1,-86,0,22); nm.Position=UDim2.new(0,14,0,4)
	nm.BackgroundTransparency=1
	nm.TextColor3=COLORS[cData.rarityIndex] or Color3.new(1,1,1)
	nm.Font=Enum.Font.GothamBold; nm.TextSize=13
	nm.TextXAlignment=Enum.TextXAlignment.Left
	nm.TextTruncate=Enum.TextTruncate.AtEnd
	nm.Text=cData.name; nm.Parent=card

	-- Info
	local slotStr = cData.slotIndex and ("Slot "..cData.slotIndex) or "Unplaced"
	local info = Instance.new("TextLabel")
	info.Size=UDim2.new(1,-86,0,18); info.Position=UDim2.new(0,14,0,26)
	info.BackgroundTransparency=1
	info.TextColor3=Color3.fromRGB(140,160,150)
	info.Font=Enum.Font.Gotham; info.TextSize=11
	info.TextXAlignment=Enum.TextXAlignment.Left
	info.Text=cData.rarity.." · +"..cData.income.."/tick · "..slotStr
	info.Parent=card

	-- Action button
	local btn = Instance.new("TextButton")
	btn.Size=UDim2.new(0,66,0,26)
	btn.Position=UDim2.new(1,-72,0.5,-13)
	btn.BorderSizePixel=0
	btn.Font=Enum.Font.GothamBold; btn.TextSize=12
	btn.Parent=card
	Instance.new("UICorner",btn).CornerRadius=UDim.new(0,5)

	if cData.slotIndex then
		btn.Text="Remove"
		btn.BackgroundColor3=Color3.fromRGB(160,40,40)
		btn.TextColor3=Color3.new(1,1,1)
		btn.MouseButton1Click:Connect(function()
			RemoveRequest:FireServer(cData.id)
		end)
	else
		btn.Text="Place"
		btn.BackgroundColor3=Color3.fromRGB(0,160,80)
		btn.TextColor3=Color3.new(1,1,1)
		btn.MouseButton1Click:Connect(function()
			PlaceRequest:FireServer(cData.id)
		end)
	end

	return card
end

----------------------------------------------------------------
-- Refresh
----------------------------------------------------------------
local function refreshUI()
	for _, child in ipairs(scroll:GetChildren()) do
		if child:IsA("Frame") then child:Destroy() end
	end
	toggleBtn.Text="Inventory ("..#inventory..")"

	-- Income rate
	local totalIncome = 0
	for _, c in ipairs(inventory) do
		if c.slotIndex then
			totalIncome = totalIncome + (c.income or 0)
		end
	end
	incLabel.Text="Income: +"..totalIncome.." every "..(Config.INCOME_INTERVAL or 10).."s"

	if #inventory == 0 then
		local empty = Instance.new("TextLabel")
		empty.Size=UDim2.new(1,-10,0,60)
		empty.BackgroundTransparency=1
		empty.TextColor3=Color3.fromRGB(100,120,110)
		empty.Font=Enum.Font.Gotham; empty.TextSize=13
		empty.TextWrapped=true
		empty.Text="No creatures yet!\nUse the Mutation Machine in your lab."
		empty.Parent=scroll
		return
	end

	-- Sort: placed first (by slot), then unplaced
	local placed = {}
	local unplaced = {}
	for _, c in ipairs(inventory) do
		if c.slotIndex then
			table.insert(placed, c)
		else
			table.insert(unplaced, c)
		end
	end
	table.sort(placed, function(a,b) return a.slotIndex < b.slotIndex end)

	local idx = 1
	for _, c in ipairs(placed) do
		createCard(c, idx); idx = idx + 1
	end
	for _, c in ipairs(unplaced) do
		createCard(c, idx); idx = idx + 1
	end
end

----------------------------------------------------------------
-- Listen
----------------------------------------------------------------
InventoryUpdate.OnClientEvent:Connect(function(data)
	inventory = data or {}
	toggleBtn.Visible = true
	refreshUI()
	-- Flash toggle button if new unplaced creature
	local hasUnplaced = false
	for _, c in ipairs(inventory) do
		if not c.slotIndex then hasUnplaced = true; break end
	end
	if hasUnplaced and not panelOpen then
		toggleBtn.TextColor3=Color3.fromRGB(255,220,50)
		TS:Create(toggleBtn,TweenInfo.new(0.8),
			{TextColor3=Color3.fromRGB(0,230,120)}):Play()
	end
end)
]=]
	invScript.Parent = spsFolder
end

-- ================================================================
--  DONE
-- ================================================================
print("========================================")
print("[MutationLab] Phase 3 installed!")
print("  New Scripts ........ InventoryManager, IncomeManager,")
print("                       InventoryUI")
print("  Updated Scripts .... Config, MutationManager,")
print("                       PlotUI, MutationClient")
print("  New Events ......... InventoryUpdate, PlaceRequest,")
print("                       RemoveRequest, IncomeNotify")
print("========================================")
print("Press F5 to test!")
print("  - Mutate to fill slots, then open Inventory")
print("  - Place/Remove creatures from display slots")
print("  - Watch passive income roll in every 10 seconds")
print("  - If all 6 slots are full, new creatures go to inventory")
print("    (open Inventory to swap them)")
