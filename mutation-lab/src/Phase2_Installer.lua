-- ================================================================
-- MUTATION LAB  —  PHASE 2 INSTALLER
-- ================================================================
-- Adds: Mutation machines, server rolls, procedural creatures,
--       animation, rarity reveal, currency system.
-- Requires Phase 1 already installed. Safe to re-run.
-- Paste into Command Bar and press Enter.
-- ================================================================

print("[MutationLab] Phase 2 installer starting...")

local WS  = game:GetService("Workspace")
local SSS = game:GetService("ServerScriptService")
local RS  = game:GetService("ReplicatedStorage")
local SP  = game:GetService("StarterPlayer")
local SPS = SP:FindFirstChild("StarterPlayerScripts")

-- Validate Phase 1
local mlRoot = WS:FindFirstChild("MutationLab")
local rsFolder = RS:FindFirstChild("MutationLab")
local sssFolder = SSS:FindFirstChild("MutationLab")
local spsFolder = SPS and SPS:FindFirstChild("MutationLab")

if not mlRoot or not rsFolder or not sssFolder then
	error("[MutationLab] Phase 1 not found! Run Phase1_Installer first.")
end

local plotsFolder = mlRoot:FindFirstChild("Plots")
if not plotsFolder then
	error("[MutationLab] Plots folder missing!")
end

-- ================================================================
--  CLEANUP PHASE 2 CONTENT (for re-runs)
-- ================================================================
print("[MutationLab] Cleaning previous Phase 2...")

-- Remove old machines
for i = 1, 8 do
	local plot = plotsFolder:FindFirstChild("Plot_" .. i)
	if plot then
		local old = plot:FindFirstChild("MutationMachine")
		if old then old:Destroy() end
		-- Remove creatures from slots
		for si = 1, 6 do
			local slot = plot:FindFirstChild("Slot_" .. si)
			if slot then
				for _, child in ipairs(slot:GetChildren()) do
					if child:IsA("Model") then child:Destroy() end
				end
			end
		end
	end
end

-- Remove Phase 2 scripts/events
local p2items = {"CreatureData","CreatureBuilder","MutationStart","MutationResult","CurrencyUpdate"}
for _, name in ipairs(p2items) do
	local item = rsFolder:FindFirstChild(name)
	if item then item:Destroy() end
end
local sssItems = {"CurrencyManager","MutationManager"}
for _, name in ipairs(sssItems) do
	local item = sssFolder:FindFirstChild(name)
	if item then item:Destroy() end
end
if spsFolder then
	local mc = spsFolder:FindFirstChild("MutationClient")
	if mc then mc:Destroy() end
end

-- ================================================================
--  MACHINE BUILDER
-- ================================================================
local MC = {
	base     = Color3.fromRGB(35, 37, 48),
	pedestal = Color3.fromRGB(45, 48, 60),
	chamber  = Color3.fromRGB(120, 220, 180),
	glow     = Color3.fromRGB(0, 255, 120),
	cap      = Color3.fromRGB(40, 42, 54),
	accent   = Color3.fromRGB(0, 255, 120),
	panel    = Color3.fromRGB(20, 20, 32),
	purple   = Color3.fromRGB(160, 40, 255),
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

local function buildMachine(plotModel, plotIndex)
	local marker = plotModel:FindFirstChild("MachineMarker")
	if not marker then
		warn("[MutationLab] No MachineMarker in Plot_" .. plotIndex)
		return
	end
	local bcf = marker.CFrame

	local machine = Instance.new("Model")
	machine.Name = "MutationMachine"
	machine:SetAttribute("PlotIndex", plotIndex)

	-- Base
	local base = mpart(machine, "Base",
		Vector3.new(10, 2, 10), bcf * CFrame.new(0, 1, 0), MC.base)
	machine.PrimaryPart = base

	-- Pedestal
	mpart(machine, "Pedestal",
		Vector3.new(6, 1, 6), bcf * CFrame.new(0, 2.5, 0), MC.pedestal)

	-- Bottom ring (neon)
	mpart(machine, "BottomRing",
		Vector3.new(7, 0.5, 7), bcf * CFrame.new(0, 3.25, 0),
		MC.accent, {neon = true})

	-- Chamber (transparent)
	mpart(machine, "Chamber",
		Vector3.new(5, 8, 5), bcf * CFrame.new(0, 7, 0),
		MC.chamber, {t = 0.7})

	-- Chamber glow (inner neon, animated during mutation)
	local cg = mpart(machine, "ChamberGlow",
		Vector3.new(4, 7, 4), bcf * CFrame.new(0, 7, 0),
		MC.glow, {neon = true, t = 0.55})

	-- PointLight inside chamber
	local pl = Instance.new("PointLight")
	pl.Color = MC.glow; pl.Brightness = 1.5; pl.Range = 25
	pl.Shadows = true; pl.Parent = cg

	-- Particle emitter (disabled until mutation)
	local pe = Instance.new("ParticleEmitter")
	pe.Name = "MutationParticles"
	pe.Color = ColorSequence.new({
		ColorSequenceKeypoint.new(0, MC.glow),
		ColorSequenceKeypoint.new(0.5, MC.purple),
		ColorSequenceKeypoint.new(1, Color3.new(1,1,1)),
	})
	pe.Size = NumberSequence.new({
		NumberSequenceKeypoint.new(0, 0.3),
		NumberSequenceKeypoint.new(0.5, 0.8),
		NumberSequenceKeypoint.new(1, 0),
	})
	pe.Lifetime = NumberRange.new(0.5, 1.5)
	pe.Rate = 0; pe.Speed = NumberRange.new(2, 5)
	pe.SpreadAngle = Vector2.new(180, 180)
	pe.LightEmission = 1; pe.Enabled = false
	pe.Parent = cg

	-- Top ring (neon)
	mpart(machine, "TopRing",
		Vector3.new(7, 0.5, 7), bcf * CFrame.new(0, 11, 0),
		MC.accent, {neon = true})

	-- Top cap
	local topCap = mpart(machine, "TopCap",
		Vector3.new(7, 1, 7), bcf * CFrame.new(0, 11.75, 0), MC.cap)

	-- Corner accent pillars (thin neon rods)
	local corners = {{-1,-1},{1,-1},{-1,1},{1,1}}
	for ci = 1, #corners do
		local cx = corners[ci][1] * 2.8
		local cz = corners[ci][2] * 2.8
		mpart(machine, "Rod_" .. ci,
			Vector3.new(0.4, 8.5, 0.4),
			bcf * CFrame.new(cx, 7, cz),
			MC.accent, {neon = true, t = 0.3})
	end

	-- Control panel (in front, -Z direction = toward player)
	local panel = mpart(machine, "ControlPanel",
		Vector3.new(4, 2.5, 0.5),
		bcf * CFrame.new(0, 3, -5.8) * CFrame.Angles(math.rad(15), 0, 0),
		MC.panel)

	-- Panel SurfaceGui
	local sg = Instance.new("SurfaceGui")
	sg.Face = Enum.NormalId.Front
	sg.LightInfluence = 0; sg.Parent = panel

	local panelTitle = Instance.new("TextLabel")
	panelTitle.Name = "Title"; panelTitle.Size = UDim2.new(1,0,0.45,0)
	panelTitle.BackgroundTransparency = 1
	panelTitle.TextColor3 = MC.glow; panelTitle.Font = Enum.Font.GothamBold
	panelTitle.TextScaled = true; panelTitle.Text = "MUTATE"
	panelTitle.Parent = sg

	local panelCost = Instance.new("TextLabel")
	panelCost.Name = "Cost"; panelCost.Size = UDim2.new(1,0,0.35,0)
	panelCost.Position = UDim2.new(0,0,0.5,0)
	panelCost.BackgroundTransparency = 1
	panelCost.TextColor3 = Color3.fromRGB(180, 220, 200)
	panelCost.Font = Enum.Font.Gotham
	panelCost.TextScaled = true; panelCost.Text = "Cost: 50 Mutagen"
	panelCost.Parent = sg

	-- ProximityPrompt
	local prompt = Instance.new("ProximityPrompt")
	prompt.ObjectText = "Mutation Machine"
	prompt.ActionText = "Mutate"
	prompt.HoldDuration = 0.5
	prompt.MaxActivationDistance = 12
	prompt.RequiresLineOfSight = false
	prompt.Parent = panel

	machine.Parent = plotModel
	marker.Transparency = 1
	marker.CanCollide = false

	print("[MutationLab]   Machine built in Plot " .. plotIndex)
end

-- ================================================================
--  BUILD MACHINES IN ALL PLOTS
-- ================================================================
print("[MutationLab] Building mutation machines...")
for i = 1, 8 do
	local plot = plotsFolder:FindFirstChild("Plot_" .. i)
	if plot then buildMachine(plot, i) end
end

-- ================================================================
--  CREATE REMOTE EVENTS
-- ================================================================
print("[MutationLab] Creating events...")
local function makeEvent(name)
	local e = Instance.new("RemoteEvent")
	e.Name = name; e.Parent = rsFolder; return e
end
makeEvent("MutationStart")
makeEvent("MutationResult")
makeEvent("CurrencyUpdate")

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
Config.PLOT_RADIUS = 160
Config.PLOT_SIZE = 64
Config.BASE_Y = 10
return Config
]=]
end

-- ================================================================
--  CREATE CREATURE DATA MODULE
-- ================================================================
print("[MutationLab] Creating CreatureData...")
local cdMS = Instance.new("ModuleScript")
cdMS.Name = "CreatureData"
cdMS.Source = [=[
local CD = {}
CD.PREFIXES = {
	"Glow","Shadow","Crystal","Neon","Void","Plasma","Toxic","Frost",
	"Ember","Storm","Lunar","Solar","Spectral","Prismatic","Quantum",
	"Arcane","Crimson","Azure","Jade","Amber","Obsidian","Radiant",
}
CD.SUFFIXES = {
	"Blob","Mite","Wisp","Fang","Shell","Core","Crawler","Sprite",
	"Drake","Golem","Wraith","Flux","Slime","Crab","Pup","Orb",
	"Shard","Beast","Moth","Worm","Jelly","Fox","Hound","Beetle",
}
function CD.generateName(seed)
	local rng = Random.new(seed)
	local p = CD.PREFIXES[rng:NextInteger(1, #CD.PREFIXES)]
	local s = CD.SUFFIXES[rng:NextInteger(1, #CD.SUFFIXES)]
	return p .. " " .. s
end
return CD
]=]
cdMS.Parent = rsFolder

-- ================================================================
--  CREATE CREATURE BUILDER MODULE
-- ================================================================
print("[MutationLab] Creating CreatureBuilder...")
local cbMS = Instance.new("ModuleScript")
cbMS.Name = "CreatureBuilder"
cbMS.Source = [=[
local CB = {}
local function cp(mdl,name,shape,sz,cf,col,opts)
	local p = Instance.new("Part")
	p.Name=name; p.Shape=shape or Enum.PartType.Block
	p.Size=sz; p.CFrame=cf; p.Color=col
	p.Material=Enum.Material.SmoothPlastic
	p.Anchored=true; p.CanCollide=false
	p.TopSurface=Enum.SurfaceType.Smooth
	p.BottomSurface=Enum.SurfaceType.Smooth
	if opts then
		if opts.n then p.Material=Enum.Material.Neon end
		if opts.t and opts.t>0 then p.Transparency=opts.t end
	end
	p.Parent=mdl; return p
end
local function vc(base,rng,amt)
	amt=amt or 20
	return Color3.fromRGB(
		math.clamp(math.floor(base.R*255)+rng:NextInteger(-amt,amt),0,255),
		math.clamp(math.floor(base.G*255)+rng:NextInteger(-amt,amt),0,255),
		math.clamp(math.floor(base.B*255)+rng:NextInteger(-amt,amt),0,255))
end
function CB.build(data)
	local m = Instance.new("Model")
	m.Name = data.name
	local rng = Random.new(data.seed)
	local ri = data.rarityIndex
	local c = data.color
	local bs = 2.2 + ri*0.3 + rng:NextNumber()*0.5
	-- Body
	local body = cp(m,"Body",Enum.PartType.Ball,
		Vector3.new(bs,bs,bs), CFrame.new(0,bs/2+0.5,0), vc(c,rng))
	m.PrimaryPart = body
	-- Eyes
	local es = 0.35 + ri*0.04
	local ey = bs/2+0.5+bs*0.12
	cp(m,"EyeL",Enum.PartType.Ball,Vector3.new(es,es,es),
		CFrame.new(-bs*0.22,ey,-bs*0.38),Color3.new(0.1,0.1,0.1))
	cp(m,"EyeR",Enum.PartType.Ball,Vector3.new(es,es,es),
		CFrame.new(bs*0.22,ey,-bs*0.38),Color3.new(0.1,0.1,0.1))
	-- Pupils
	cp(m,"PupL",Enum.PartType.Ball,Vector3.new(es*0.45,es*0.45,es*0.45),
		CFrame.new(-bs*0.22,ey+es*0.1,-bs*0.38-es*0.35),Color3.new(1,1,1))
	cp(m,"PupR",Enum.PartType.Ball,Vector3.new(es*0.45,es*0.45,es*0.45),
		CFrame.new(bs*0.22,ey+es*0.1,-bs*0.38-es*0.35),Color3.new(1,1,1))
	-- Rare+: crystal/spike features
	if ri >= 2 then
		local n = ri + rng:NextInteger(0,2)
		for j = 1, n do
			local a = (j/n)*math.pi*2
			local sz = 0.4+ri*0.15+rng:NextNumber()*0.3
			cp(m,"Feat_"..j,Enum.PartType.Block,
				Vector3.new(sz,sz*1.6,sz),
				CFrame.new(math.cos(a)*bs*0.38,bs/2+0.5+rng:NextNumber()*bs*0.25,
					math.sin(a)*bs*0.38)*CFrame.Angles(rng:NextNumber()*0.4,a,rng:NextNumber()*0.4),
				vc(c,rng,30))
		end
	end
	-- Legendary+: wings
	if ri >= 4 then
		for _,wx in ipairs({-1,1}) do
			cp(m,wx<0 and "WingL" or "WingR",Enum.PartType.Block,
				Vector3.new(2.2+ri*0.2,0.15,1.8),
				CFrame.new(wx*(bs*0.45+1.2),bs/2+0.5+bs*0.15,0)
					*CFrame.Angles(0,0,wx*math.rad(22)),
				vc(c,rng,15))
		end
	end
	-- Mythic+: crown
	if ri >= 5 then
		cp(m,"Crown",Enum.PartType.Block,Vector3.new(0.9,0.9,0.9),
			CFrame.new(0,bs+1,0)*CFrame.Angles(0,math.rad(45),0),
			Color3.fromRGB(255,200,50),{n=true})
	end
	-- Secret: ethereal aura + particles
	if ri >= 6 then
		cp(m,"Aura",Enum.PartType.Ball,Vector3.new(bs*1.4,bs*1.4,bs*1.4),
			CFrame.new(0,bs/2+0.5,0),Color3.new(1,1,1),{n=true,t=0.55})
		local pe=Instance.new("ParticleEmitter")
		pe.Color=ColorSequence.new(Color3.new(1,1,1))
		pe.Size=NumberSequence.new({NumberSequenceKeypoint.new(0,0.3),NumberSequenceKeypoint.new(1,0)})
		pe.Lifetime=NumberRange.new(1,2.5); pe.Rate=12
		pe.Speed=NumberRange.new(0.5,2)
		pe.SpreadAngle=Vector2.new(180,180); pe.LightEmission=1
		pe.Parent=body
	end
	-- Glow for Epic+
	if ri >= 3 then
		local pl=Instance.new("PointLight")
		pl.Color=c; pl.Brightness=0.4+ri*0.15; pl.Range=6+ri*2
		pl.Parent=body
	end
	-- Nameplate billboard
	local bb=Instance.new("BillboardGui")
	bb.Name="Label"; bb.Size=UDim2.new(0,120,0,50)
	bb.StudsOffset=Vector3.new(0,bs/2+2,0); bb.AlwaysOnTop=false
	local rl=Instance.new("TextLabel")
	rl.Size=UDim2.new(1,0,0.5,0); rl.BackgroundTransparency=1
	rl.TextColor3=c; rl.Font=Enum.Font.GothamBold
	rl.TextScaled=true; rl.Text=data.rarity
	rl.TextStrokeTransparency=0; rl.TextStrokeColor3=Color3.new(0,0,0)
	rl.Parent=bb
	local nl=Instance.new("TextLabel")
	nl.Size=UDim2.new(1,0,0.45,0); nl.Position=UDim2.new(0,0,0.55,0)
	nl.BackgroundTransparency=1; nl.TextColor3=Color3.fromRGB(220,220,220)
	nl.Font=Enum.Font.Gotham; nl.TextScaled=true; nl.Text=data.name
	nl.TextStrokeTransparency=0; nl.TextStrokeColor3=Color3.new(0,0,0)
	nl.Parent=bb
	bb.Parent=body
	return m
end
return CB
]=]
cbMS.Parent = rsFolder

-- ================================================================
--  CREATE CURRENCY MANAGER MODULE
-- ================================================================
print("[MutationLab] Creating CurrencyManager...")
local cmMS = Instance.new("ModuleScript")
cmMS.Name = "CurrencyManager"
cmMS.Source = [=[
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
]=]
cmMS.Parent = sssFolder

-- ================================================================
--  UPDATE PLOT MANAGER (adds OwnerId attribute)
-- ================================================================
print("[MutationLab] Updating PlotManager...")
local pmScript = sssFolder:FindFirstChild("PlotManager")
if pmScript then
	pmScript.Source = [=[
local Players = game:GetService("Players")
local RS = game:GetService("ReplicatedStorage")
local mlFolder = RS:WaitForChild("MutationLab")
local Config = require(mlFolder:WaitForChild("Config"))
local PlotAssigned = mlFolder:WaitForChild("PlotAssigned")
local plotsFolder = workspace:WaitForChild("MutationLab"):WaitForChild("Plots")
local NUM_PLOTS = Config.NUM_PLOTS
local plots = {}
local playerPlots = {}
for i = 1, NUM_PLOTS do
	local model = plotsFolder:WaitForChild("Plot_" .. i)
	plots[i] = {model = model, owner = nil}
	model:SetAttribute("OwnerId", 0)
end
print("[PlotManager] Initialised " .. NUM_PLOTS .. " plots")
local function getSignText(idx, partName)
	local sp = plots[idx].model:FindFirstChild(partName)
	if not sp then return nil end
	local gui = sp:FindFirstChildWhichIsA("SurfaceGui")
	if not gui then return nil end
	return gui:FindFirstChild("SignText")
end
local function updateSign(idx, name)
	local st = getSignText(idx, "StatusSign")
	if not st then return end
	if name then
		st.Text = name
		st.TextColor3 = Color3.fromRGB(0,255,120)
	else
		st.Text = "AVAILABLE"
		st.TextColor3 = Color3.fromRGB(100,220,160)
	end
end
local function assignPlot(player)
	if playerPlots[player] then return playerPlots[player] end
	for i = 1, NUM_PLOTS do
		if plots[i].owner == nil then
			plots[i].owner = player
			playerPlots[player] = i
			plots[i].model:SetAttribute("OwnerId", player.UserId)
			updateSign(i, player.Name)
			PlotAssigned:FireClient(player, i)
			print("[PlotManager] " .. player.Name .. " -> Plot " .. i)
			return i
		end
	end
	warn("[PlotManager] No plots for " .. player.Name)
	return nil
end
local function releasePlot(player)
	local idx = playerPlots[player]
	if not idx then return end
	plots[idx].owner = nil
	plots[idx].model:SetAttribute("OwnerId", 0)
	playerPlots[player] = nil
	updateSign(idx, nil)
	-- Clean up creatures from this plot
	for si = 1, 6 do
		local slot = plots[idx].model:FindFirstChild("Slot_" .. si)
		if slot then
			for _, child in ipairs(slot:GetChildren()) do
				if child:IsA("Model") then child:Destroy() end
			end
		end
	end
	print("[PlotManager] Plot " .. idx .. " released")
end
local function teleportToPlot(character, idx)
	local sp = plots[idx].model:FindFirstChild("PlotSpawn")
	if sp then character:PivotTo(sp.CFrame + Vector3.new(0,3,0)) end
end
Players.PlayerAdded:Connect(function(player)
	player.CharacterAdded:Connect(function(character)
		task.wait(0.5)
		local idx = playerPlots[player] or assignPlot(player)
		if idx and character.Parent then teleportToPlot(character, idx) end
	end)
end)
Players.PlayerRemoving:Connect(function(player)
	releasePlot(player)
end)
game:BindToClose(function()
	for _, pd in pairs(plots) do
		if pd.owner then releasePlot(pd.owner) end
	end
end)
]=]
end

-- ================================================================
--  CREATE MUTATION MANAGER SCRIPT
-- ================================================================
print("[MutationLab] Creating MutationManager...")
local mmScript = Instance.new("Script")
mmScript.Name = "MutationManager"
mmScript.Source = [=[
local Players = game:GetService("Players")
local RS = game:GetService("ReplicatedStorage")
local SSS = game:GetService("ServerScriptService")
local mlFolder = RS:WaitForChild("MutationLab")
local Config = require(mlFolder:WaitForChild("Config"))
local CreatureData = require(mlFolder:WaitForChild("CreatureData"))
local CreatureBuilder = require(mlFolder:WaitForChild("CreatureBuilder"))
local CM = require(SSS:WaitForChild("MutationLab"):WaitForChild("CurrencyManager"))
local MutationStart = mlFolder:WaitForChild("MutationStart")
local MutationResult = mlFolder:WaitForChild("MutationResult")
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
	for si = 1, 6 do
		local slot = plotModel:FindFirstChild("Slot_" .. si)
		if slot and not slot:FindFirstChildOfClass("Model") then
			return si, slot
		end
	end
	return nil, nil
end

local function getPlotFromPrompt(prompt)
	local cur = prompt.Parent
	while cur and cur ~= workspace do
		if cur.Name:match("^Plot_%d+$") then return cur end
		cur = cur.Parent
	end
	return nil
end

local function handleMutation(player, prompt)
	local plotModel = getPlotFromPrompt(prompt)
	if not plotModel then return end
	local ownerId = plotModel:GetAttribute("OwnerId")
	if ownerId ~= player.UserId then return end
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
		local creature = CreatureBuilder.build(cData)
		if slot then
			creature:PivotTo(slot.CFrame + Vector3.new(0, 1.5, 0))
			creature.Parent = slot
			slot.Color = rInfo.color
			slot.Transparency = 0.3
		else
			local machine = plotModel:FindFirstChild("MutationMachine")
			if machine and machine.PrimaryPart then
				creature:PivotTo(machine.PrimaryPart.CFrame + Vector3.new(6, 3, 0))
			end
			creature.Parent = plotModel
		end
		MutationResult:FireClient(player, cData, plotIdx)
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

-- Init currency for joining players
Players.PlayerAdded:Connect(function(player)
	CM.init(player, Config.STARTER_CURRENCY)
end)
Players.PlayerRemoving:Connect(function(player)
	mutating[player] = nil
	cooldowns[player] = nil
	CM.cleanup(player)
end)
]=]
mmScript.Parent = sssFolder

-- ================================================================
--  UPDATE PLOT UI (add currency HUD)
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

local gui = Instance.new("ScreenGui")
gui.Name="PlotUI"; gui.ResetOnSpawn=false
gui.ZIndexBehavior=Enum.ZIndexBehavior.Sibling; gui.Parent=pGui

-- HUD Bar (top-left)
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
	-- Flash effect
	currLabel.TextColor3=Color3.fromRGB(100,255,180)
	TS:Create(currLabel,TweenInfo.new(0.4),{TextColor3=Color3.fromRGB(0,230,110)}):Play()
end)
]=]
end

-- ================================================================
--  CREATE MUTATION CLIENT (animation + reveal)
-- ================================================================
print("[MutationLab] Creating MutationClient...")
if spsFolder then
	local mcScript = Instance.new("LocalScript")
	mcScript.Name = "MutationClient"
	mcScript.Source = [=[
local TS = game:GetService("TweenService")
local RS = game:GetService("ReplicatedStorage")
local ml = RS:WaitForChild("MutationLab")
local MutationStart = ml:WaitForChild("MutationStart")
local MutationResult = ml:WaitForChild("MutationResult")
local plotsFolder = workspace:WaitForChild("MutationLab"):WaitForChild("Plots")

local RARITY_COLORS = {
	Color3.fromRGB(200,200,200), Color3.fromRGB(0,150,255),
	Color3.fromRGB(180,0,255), Color3.fromRGB(255,200,0),
	Color3.fromRGB(255,50,50), Color3.fromRGB(255,255,255),
}

MutationStart.OnClientEvent:Connect(function(plotIdx, duration)
	local plot = plotsFolder:FindFirstChild("Plot_" .. plotIdx)
	if not plot then return end
	local machine = plot:FindFirstChild("MutationMachine")
	if not machine then return end
	local cg = machine:FindFirstChild("ChamberGlow")
	-- Find particles
	local pe = nil
	for _, d in ipairs(machine:GetDescendants()) do
		if d:IsA("ParticleEmitter") then pe = d; break end
	end
	if pe then pe.Enabled = true; pe.Rate = 40 end
	if not cg then return end
	-- Color cycling animation
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
	-- Stop particles
	for _, d in ipairs(machine:GetDescendants()) do
		if d:IsA("ParticleEmitter") then d.Enabled = false end
	end
	-- Flash rarity color
	if cg then
		cg.Color = cData.color; cg.Transparency = 0
		TS:Create(cg, TweenInfo.new(2), {Transparency = 0.5}):Play()
	end
	-- Rarity reveal billboard
	local anchor = machine:FindFirstChild("TopCap") or machine:FindFirstChild("Base")
	if not anchor then return end
	local old = anchor:FindFirstChild("RarityReveal")
	if old then old:Destroy() end
	local bb = Instance.new("BillboardGui")
	bb.Name = "RarityReveal"; bb.Size = UDim2.new(0,10,0,4)
	bb.StudsOffset = Vector3.new(0,3,0); bb.AlwaysOnTop = true
	bb.Parent = anchor
	local rl = Instance.new("TextLabel")
	rl.Size=UDim2.new(1,0,0.5,0); rl.BackgroundTransparency=1
	rl.TextColor3=cData.color; rl.Font=Enum.Font.GothamBold
	rl.TextScaled=true; rl.Text=string.upper(cData.rarity)
	rl.TextStrokeTransparency=0; rl.TextStrokeColor3=Color3.new(0,0,0)
	rl.Parent=bb
	local nl = Instance.new("TextLabel")
	nl.Size=UDim2.new(1,0,0.4,0); nl.Position=UDim2.new(0,0,0.55,0)
	nl.BackgroundTransparency=1; nl.TextColor3=Color3.fromRGB(230,230,230)
	nl.Font=Enum.Font.Gotham; nl.TextScaled=true; nl.Text=cData.name
	nl.TextStrokeTransparency=0; nl.TextStrokeColor3=Color3.new(0,0,0)
	nl.Parent=bb
	-- Pop-in
	TS:Create(bb,TweenInfo.new(0.4,Enum.EasingStyle.Back),
		{Size=UDim2.new(0,220,0,90)}):Play()
	-- Fade out
	task.delay(4, function()
		if not bb.Parent then return end
		TS:Create(rl,TweenInfo.new(0.5),{TextTransparency=1,TextStrokeTransparency=1}):Play()
		TS:Create(nl,TweenInfo.new(0.5),{TextTransparency=1,TextStrokeTransparency=1}):Play()
		task.wait(0.6)
		if bb.Parent then bb:Destroy() end
	end)
end)
]=]
	mcScript.Parent = spsFolder
end

-- ================================================================
--  DONE
-- ================================================================
print("========================================")
print("[MutationLab] Phase 2 installed!")
print("  Mutation Machines .. 8")
print("  New Scripts ........ CreatureData, CreatureBuilder,")
print("                       CurrencyManager, MutationManager,")
print("                       MutationClient")
print("  Updated Scripts .... Config, PlotManager, PlotUI")
print("  New Events ......... MutationStart, MutationResult,")
print("                       CurrencyUpdate")
print("========================================")
print("Press F5 to test! Walk to the machine in your lab and")
print("press E (or tap) to mutate. Costs 50 Mutagen per roll.")
