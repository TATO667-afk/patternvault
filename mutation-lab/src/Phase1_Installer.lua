-- ================================================================
-- MUTATION LAB  —  PHASE 1 INSTALLER  (v2)
-- ================================================================
-- Paste this entire script into Roblox Studio's Command Bar and
-- press Enter. It builds the lobby, 8 laboratory plots, corridors,
-- lighting, and all gameplay scripts.
--
-- Safe to re-run: removes the previous installation first.
-- ================================================================

print("[MutationLab] Phase 1 installer starting...")

----------------------------------------------------------------
-- Services
----------------------------------------------------------------
local WS       = game:GetService("Workspace")
local Lighting  = game:GetService("Lighting")
local SSS       = game:GetService("ServerScriptService")
local RS        = game:GetService("ReplicatedStorage")
local SP        = game:GetService("StarterPlayer")
local SPS       = SP:FindFirstChild("StarterPlayerScripts")

----------------------------------------------------------------
-- Clean previous install
----------------------------------------------------------------
print("[MutationLab] Cleaning previous install...")
if WS:FindFirstChild("MutationLab")  then WS.MutationLab:Destroy() end
if WS:FindFirstChild("Baseplate")    then WS.Baseplate:Destroy() end
if SSS:FindFirstChild("MutationLab") then SSS.MutationLab:Destroy() end
if RS:FindFirstChild("MutationLab")  then RS.MutationLab:Destroy() end
if SPS and SPS:FindFirstChild("MutationLab") then SPS.MutationLab:Destroy() end
for _, c in ipairs(Lighting:GetChildren()) do
	if c:GetAttribute("MutationLab") then c:Destroy() end
end

----------------------------------------------------------------
-- Constants
----------------------------------------------------------------
local NUM_PLOTS   = 8
local PLOT_RADIUS = 160
local PLOT_SIZE   = 64
local PLOT_HALF   = 32
local FLOOR_H     = 2
local WALL_H      = 18
local WALL_T      = 2
local LOBBY_SIZE  = 80
local LOBBY_HALF  = 40
local CORR_W      = 16
local BASE_Y      = 10
local NEON_H      = 0.5

-- Derived
local CORR_LEN      = PLOT_RADIUS - PLOT_HALF - LOBBY_HALF
local CORR_DIST     = LOBBY_HALF + CORR_LEN / 2
local WALL_Y        = FLOOR_H / 2 + WALL_H / 2
local NEON_Y        = FLOOR_H / 2 + WALL_H + NEON_H / 2
local SIDE_LEN      = PLOT_SIZE - WALL_T * 2
local FRONT_SEG_LEN = PLOT_HALF - WALL_T - CORR_W / 2
local FRONT_SEG_CX  = (PLOT_HALF - WALL_T + CORR_W / 2) / 2

-- Palette (brightened for visibility)
local C = {
	lobbyFloor = Color3.fromRGB(60, 62, 78),
	plotFloor  = Color3.fromRGB(50, 52, 66),
	corridor   = Color3.fromRGB(55, 57, 72),
	wall       = Color3.fromRGB(65, 68, 82),
	wallDark   = Color3.fromRGB(42, 44, 56),
	neonGreen  = Color3.fromRGB(0, 255, 120),
	neonPurple = Color3.fromRGB(160, 40, 255),
	signBg     = Color3.fromRGB(18, 18, 30),
	pillar     = Color3.fromRGB(70, 73, 88),
	text       = Color3.fromRGB(0, 255, 120),
	textDim    = Color3.fromRGB(100, 220, 160),
}

----------------------------------------------------------------
-- Helpers
----------------------------------------------------------------
local root = Instance.new("Folder")
root.Name = "MutationLab"
root.Parent = WS

local function part(parent, name, size, cf, color, opts)
	local p = Instance.new("Part")
	p.Name     = name
	p.Anchored = true
	p.Size     = size
	p.CFrame   = cf
	p.Color    = color
	p.Material = Enum.Material.SmoothPlastic
	p.TopSurface    = Enum.SurfaceType.Smooth
	p.BottomSurface = Enum.SurfaceType.Smooth
	if opts then
		if opts.neon then p.Material = Enum.Material.Neon end
		if opts.t and opts.t > 0 then p.Transparency = opts.t end
		if opts.cc ~= nil then p.CanCollide  = opts.cc end
		if opts.cs ~= nil then p.CastShadow  = opts.cs end
	end
	p.Parent = parent
	return p
end

local function pointLight(parent, color, brightness, range)
	local pl = Instance.new("PointLight")
	pl.Color      = color
	pl.Brightness = brightness or 1
	pl.Range      = range or 30
	pl.Shadows    = true
	pl.Parent     = parent
	return pl
end

local function surfaceSign(parent, face, text, textColor)
	local sg = Instance.new("SurfaceGui")
	sg.Face            = face
	sg.LightInfluence  = 0
	sg.ClipsDescendants = true
	sg.Parent          = parent

	local tl = Instance.new("TextLabel")
	tl.Name                  = "SignText"
	tl.Size                  = UDim2.new(1, 0, 1, 0)
	tl.BackgroundColor3      = C.signBg
	tl.BackgroundTransparency = 0.5
	tl.TextColor3            = textColor or C.text
	tl.Font                  = Enum.Font.GothamBold
	tl.TextScaled            = true
	tl.Text                  = text
	tl.Parent                = sg
	return sg, tl
end

local function taggedEffect(className, name, props)
	local e = Instance.new(className)
	e.Name = name
	e:SetAttribute("MutationLab", true)
	for k, v in pairs(props) do
		e[k] = v
	end
	e.Parent = Lighting
end

-- ================================================================
--  BUILD LOBBY
-- ================================================================
print("[MutationLab] Building lobby...")
local lobbyF = Instance.new("Folder")
lobbyF.Name   = "Lobby"
lobbyF.Parent = root

-- Main floor
part(lobbyF, "Floor",
	Vector3.new(LOBBY_SIZE, FLOOR_H, LOBBY_SIZE),
	CFrame.new(0, BASE_Y, 0), C.lobbyFloor)

-- Centre raised ring
part(lobbyF, "CentreRing",
	Vector3.new(22, 0.4, 22),
	CFrame.new(0, BASE_Y + FLOOR_H / 2 + 0.2, 0), C.wallDark)

-- Glowing centre column
local col = part(lobbyF, "CentreColumn",
	Vector3.new(5, 28, 5),
	CFrame.new(0, BASE_Y + 14, 0),
	C.neonGreen, { neon = true, t = 0.2 })
pointLight(col, C.neonGreen, 3, 80)

-- Inner glow ring on floor
part(lobbyF, "InnerGlow",
	Vector3.new(12, 0.6, 12),
	CFrame.new(0, BASE_Y + FLOOR_H / 2 + 0.3, 0),
	C.neonGreen, { neon = true, t = 0.3 })

-- Title billboard (reads from front and back)
local titlePart = part(lobbyF, "Title",
	Vector3.new(42, 7, 1),
	CFrame.new(0, BASE_Y + 34, 0), C.signBg)
surfaceSign(titlePart, Enum.NormalId.Front, "MUTATION LAB", C.neonGreen)
surfaceSign(titlePart, Enum.NormalId.Back,  "MUTATION LAB", C.neonGreen)

-- Subtitle
local subPart = part(lobbyF, "Subtitle",
	Vector3.new(30, 3, 1),
	CFrame.new(0, BASE_Y + 27.5, 0), C.signBg)
surfaceSign(subPart, Enum.NormalId.Front, "COLLECT  ·  MUTATE  ·  DISCOVER", C.textDim)
surfaceSign(subPart, Enum.NormalId.Back,  "COLLECT  ·  MUTATE  ·  DISCOVER", C.textDim)

-- Four spawn locations
local spawnOffsets = {
	Vector3.new(-12, 0, -12),
	Vector3.new( 12, 0, -12),
	Vector3.new(-12, 0,  12),
	Vector3.new( 12, 0,  12),
}
for si = 1, #spawnOffsets do
	local off = spawnOffsets[si]
	local sp = Instance.new("SpawnLocation")
	sp.Name     = "Spawn_" .. si
	sp.Anchored = true
	sp.Size     = Vector3.new(6, 1, 6)
	sp.CFrame   = CFrame.new(off.X, BASE_Y + FLOOR_H / 2 + 0.5, off.Z)
	sp.Color    = C.neonGreen
	sp.Material = Enum.Material.Neon
	sp.Transparency   = 0.5
	sp.TopSurface     = Enum.SurfaceType.Smooth
	sp.BottomSurface  = Enum.SurfaceType.Smooth
	sp.CanCollide     = true
	sp.Duration       = 0
	sp.Parent         = lobbyF
end
print("[MutationLab] Lobby done. Spawns placed.")

-- Corner pillars
local pillarSigns = { {-1,-1}, {1,-1}, {-1,1}, {1,1} }
for pi = 1, #pillarSigns do
	local sx = pillarSigns[pi][1]
	local sz = pillarSigns[pi][2]
	local px = sx * (LOBBY_HALF - 3)
	local pz = sz * (LOBBY_HALF - 3)
	part(lobbyF, "Pillar_" .. pi,
		Vector3.new(4, 22, 4),
		CFrame.new(px, BASE_Y + 11, pz), C.pillar)
	local strip = part(lobbyF, "PillarNeon_" .. pi,
		Vector3.new(4.2, 0.8, 4.2),
		CFrame.new(px, BASE_Y + 21, pz),
		C.neonPurple, { neon = true })
	pointLight(strip, C.neonPurple, 0.8, 25)
end

-- Floor edge neon strips (lobby perimeter)
-- Top edge (Z = -LOBBY_HALF)
part(lobbyF, "EdgeN", Vector3.new(LOBBY_SIZE, 0.3, 1),
	CFrame.new(0, BASE_Y + FLOOR_H / 2 + 0.15, -LOBBY_HALF),
	C.neonPurple, { neon = true, t = 0.2 })
-- Bottom edge (Z = +LOBBY_HALF)
part(lobbyF, "EdgeS", Vector3.new(LOBBY_SIZE, 0.3, 1),
	CFrame.new(0, BASE_Y + FLOOR_H / 2 + 0.15, LOBBY_HALF),
	C.neonPurple, { neon = true, t = 0.2 })
-- Left edge (X = -LOBBY_HALF)
part(lobbyF, "EdgeW", Vector3.new(1, 0.3, LOBBY_SIZE),
	CFrame.new(-LOBBY_HALF, BASE_Y + FLOOR_H / 2 + 0.15, 0),
	C.neonPurple, { neon = true, t = 0.2 })
-- Right edge (X = +LOBBY_HALF)
part(lobbyF, "EdgeE", Vector3.new(1, 0.3, LOBBY_SIZE),
	CFrame.new(LOBBY_HALF, BASE_Y + FLOOR_H / 2 + 0.15, 0),
	C.neonPurple, { neon = true, t = 0.2 })

print("[MutationLab] Lobby decorations done.")

-- ================================================================
--  BUILD PLOTS
-- ================================================================
print("[MutationLab] Building " .. NUM_PLOTS .. " plots...")
local plotsF = Instance.new("Folder")
plotsF.Name   = "Plots"
plotsF.Parent = root

for i = 1, NUM_PLOTS do
	local ang = math.rad((i - 1) * 360 / NUM_PLOTS)
	local px  = PLOT_RADIUS * math.cos(ang)
	local pz  = PLOT_RADIUS * math.sin(ang)
	local ctr = Vector3.new(px, BASE_Y, pz)
	local cf  = CFrame.lookAt(ctr, Vector3.new(0, BASE_Y, 0))

	local pm = Instance.new("Model")
	pm.Name = "Plot_" .. i

	-- Floor
	local fl = part(pm, "Floor",
		Vector3.new(PLOT_SIZE, FLOOR_H, PLOT_SIZE), cf, C.plotFloor)
	pm.PrimaryPart = fl

	-- Back wall
	part(pm, "BackWall",
		Vector3.new(PLOT_SIZE, WALL_H, WALL_T),
		cf * CFrame.new(0, WALL_Y, PLOT_HALF - WALL_T / 2), C.wall)

	-- Back neon
	local bn = part(pm, "BackNeon",
		Vector3.new(PLOT_SIZE + 0.2, NEON_H, WALL_T + 0.2),
		cf * CFrame.new(0, NEON_Y, PLOT_HALF - WALL_T / 2),
		C.neonGreen, { neon = true })
	pointLight(bn, C.neonGreen, 1, 45)

	-- Left wall
	part(pm, "LeftWall",
		Vector3.new(WALL_T, WALL_H, SIDE_LEN),
		cf * CFrame.new(-PLOT_HALF + WALL_T / 2, WALL_Y, 0), C.wall)
	part(pm, "LeftNeon",
		Vector3.new(WALL_T + 0.2, NEON_H, SIDE_LEN + 0.2),
		cf * CFrame.new(-PLOT_HALF + WALL_T / 2, NEON_Y, 0),
		C.neonGreen, { neon = true })

	-- Right wall
	part(pm, "RightWall",
		Vector3.new(WALL_T, WALL_H, SIDE_LEN),
		cf * CFrame.new(PLOT_HALF - WALL_T / 2, WALL_Y, 0), C.wall)
	part(pm, "RightNeon",
		Vector3.new(WALL_T + 0.2, NEON_H, SIDE_LEN + 0.2),
		cf * CFrame.new(PLOT_HALF - WALL_T / 2, NEON_Y, 0),
		C.neonGreen, { neon = true })

	-- Front-left wall segment
	part(pm, "FrontLeft",
		Vector3.new(FRONT_SEG_LEN, WALL_H, WALL_T),
		cf * CFrame.new(-FRONT_SEG_CX, WALL_Y, -PLOT_HALF + WALL_T / 2), C.wall)

	-- Front-right wall segment
	part(pm, "FrontRight",
		Vector3.new(FRONT_SEG_LEN, WALL_H, WALL_T),
		cf * CFrame.new(FRONT_SEG_CX, WALL_Y, -PLOT_HALF + WALL_T / 2), C.wall)

	-- Doorway neon accents
	part(pm, "DoorNeonL",
		Vector3.new(0.4, WALL_H, WALL_T + 0.2),
		cf * CFrame.new(-CORR_W / 2 + 0.2, WALL_Y, -PLOT_HALF + WALL_T / 2),
		C.neonPurple, { neon = true })
	part(pm, "DoorNeonR",
		Vector3.new(0.4, WALL_H, WALL_T + 0.2),
		cf * CFrame.new(CORR_W / 2 - 0.2, WALL_Y, -PLOT_HALF + WALL_T / 2),
		C.neonPurple, { neon = true })

	-- Lab number sign (inside back wall, faces interior)
	local labSign = part(pm, "LabSign",
		Vector3.new(18, 5, 0.4),
		cf * CFrame.new(0, FLOOR_H / 2 + WALL_H - 6, PLOT_HALF - WALL_T - 0.3),
		C.signBg)
	surfaceSign(labSign, Enum.NormalId.Front, "LAB " .. i, C.neonGreen)

	-- Status sign (player name or AVAILABLE)
	local statusSign = part(pm, "StatusSign",
		Vector3.new(18, 3, 0.4),
		cf * CFrame.new(0, FLOOR_H / 2 + WALL_H - 10.5, PLOT_HALF - WALL_T - 0.3),
		C.signBg)
	surfaceSign(statusSign, Enum.NormalId.Front, "AVAILABLE", C.textDim)

	-- Mutation machine placeholder (glowing floor marker)
	local marker = part(pm, "MachineMarker",
		Vector3.new(10, 0.3, 10),
		cf * CFrame.new(0, FLOOR_H / 2 + 0.15, 8),
		C.neonPurple, { neon = true, t = 0.3 })
	pointLight(marker, C.neonPurple, 0.8, 20)

	-- Display slot markers (6 spots for future creature display)
	local slotPositions = {
		Vector3.new(-16, 0, -8),
		Vector3.new(  0, 0, -8),
		Vector3.new( 16, 0, -8),
		Vector3.new(-16, 0,  16),
		Vector3.new(  0, 0,  16),
		Vector3.new( 16, 0,  16),
	}
	for si = 1, #slotPositions do
		local soff = slotPositions[si]
		part(pm, "Slot_" .. si,
			Vector3.new(5, 0.2, 5),
			cf * CFrame.new(soff.X, FLOOR_H / 2 + 0.1, soff.Z),
			C.neonGreen, { neon = true, t = 0.5 })
	end

	-- Plot spawn point (invisible, for teleport targeting)
	part(pm, "PlotSpawn",
		Vector3.new(4, 0.5, 4),
		cf * CFrame.new(0, FLOOR_H / 2 + 0.25, -6),
		C.neonGreen, { t = 1, cc = false, cs = false })

	-- Ambient ceiling light
	local labLight = part(pm, "LabLight",
		Vector3.new(2, 1, 2),
		cf * CFrame.new(0, FLOOR_H / 2 + WALL_H - 1, 0),
		C.neonGreen, { neon = true, t = 0.7 })
	pointLight(labLight, C.neonGreen, 1, 60)

	pm.Parent = plotsF
	print("[MutationLab]   Plot " .. i .. " built")
end

-- ================================================================
--  BUILD CORRIDORS
-- ================================================================
print("[MutationLab] Building corridors...")
local corrF = Instance.new("Folder")
corrF.Name   = "Corridors"
corrF.Parent = root

for i = 1, NUM_PLOTS do
	local ang = math.rad((i - 1) * 360 / NUM_PLOTS)
	local dx  = math.cos(ang)
	local dz  = math.sin(ang)
	local mid = Vector3.new(dx * CORR_DIST, BASE_Y, dz * CORR_DIST)
	local cf  = CFrame.lookAt(mid, Vector3.new(0, BASE_Y, 0))

	-- Floor
	part(corrF, "Floor_" .. i,
		Vector3.new(CORR_W, FLOOR_H, CORR_LEN), cf, C.corridor)

	-- Left railing
	part(corrF, "RailL_" .. i,
		Vector3.new(WALL_T, 4, CORR_LEN),
		cf * CFrame.new(-CORR_W / 2 + WALL_T / 2, FLOOR_H / 2 + 2, 0),
		C.wallDark)

	-- Right railing
	part(corrF, "RailR_" .. i,
		Vector3.new(WALL_T, 4, CORR_LEN),
		cf * CFrame.new(CORR_W / 2 - WALL_T / 2, FLOOR_H / 2 + 2, 0),
		C.wallDark)

	-- Neon on railings (alternating green / purple)
	local neonCol = C.neonGreen
	if i % 2 == 0 then neonCol = C.neonPurple end

	part(corrF, "NeonL_" .. i,
		Vector3.new(WALL_T + 0.1, 0.4, CORR_LEN),
		cf * CFrame.new(-CORR_W / 2 + WALL_T / 2, FLOOR_H / 2 + 4.2, 0),
		neonCol, { neon = true })

	part(corrF, "NeonR_" .. i,
		Vector3.new(WALL_T + 0.1, 0.4, CORR_LEN),
		cf * CFrame.new(CORR_W / 2 - WALL_T / 2, FLOOR_H / 2 + 4.2, 0),
		neonCol, { neon = true })

	-- Centre floor guide strip
	part(corrF, "Strip_" .. i,
		Vector3.new(1, 0.2, CORR_LEN - 4),
		cf * CFrame.new(0, FLOOR_H / 2 + 0.1, 0),
		neonCol, { neon = true, t = 0.2 })

	-- Entrance sign (at lobby edge, faces lobby)
	local signPos = Vector3.new(
		dx * (LOBBY_HALF + 6),
		BASE_Y + FLOOR_H / 2 + 5,
		dz * (LOBBY_HALF + 6)
	)
	local signCF = CFrame.lookAt(signPos, Vector3.new(0, signPos.Y, 0))
	local entrSign = part(corrF, "EntranceSign_" .. i,
		Vector3.new(8, 4, 0.4), signCF, C.signBg)
	surfaceSign(entrSign, Enum.NormalId.Front, "LAB " .. i, neonCol)
end
print("[MutationLab] Corridors done.")

-- ================================================================
--  LIGHTING & ATMOSPHERE
-- ================================================================
print("[MutationLab] Configuring lighting...")
Lighting.ClockTime      = 6
Lighting.Brightness     = 0.3
Lighting.Ambient        = Color3.fromRGB(30, 32, 45)
Lighting.OutdoorAmbient = Color3.fromRGB(22, 24, 35)
Lighting.GlobalShadows  = true
Lighting.EnvironmentDiffuseScale = 0.5
Lighting.EnvironmentSpecularScale = 0.5

local ok, err = pcall(function()
	Lighting.Technology = Enum.Technology.ShadowMap
end)
if not ok then
	print("[MutationLab] ShadowMap not available, using default: " .. tostring(err))
end

WS.FallenPartsDestroyHeight = -100

taggedEffect("Atmosphere", "LabAtmosphere", {
	Density = 0.25,
	Offset  = 0.25,
	Color   = Color3.fromRGB(20, 25, 45),
	Decay   = Color3.fromRGB(15, 20, 40),
	Glare   = 0,
	Haze    = 2,
})

taggedEffect("BloomEffect", "LabBloom", {
	Intensity = 0.5,
	Size      = 30,
	Threshold = 0.6,
})

taggedEffect("ColorCorrectionEffect", "LabCC", {
	Brightness = 0.03,
	Contrast   = 0.1,
	Saturation = 0.2,
	TintColor  = Color3.fromRGB(210, 240, 255),
})
print("[MutationLab] Lighting done.")

-- ================================================================
--  SKY (dark sci-fi background)
-- ================================================================
local sky = Instance.new("Sky")
sky.Name = "LabSky"
sky:SetAttribute("MutationLab", true)
sky.CelestialBodiesShown = false
sky.StarCount = 800
sky.SkyboxBk = ""
sky.SkyboxDn = ""
sky.SkyboxFt = ""
sky.SkyboxLf = ""
sky.SkyboxRt = ""
sky.SkyboxUp = ""
sky.Parent = Lighting

-- ================================================================
--  CREATE SCRIPTS
-- ================================================================
print("[MutationLab] Creating scripts...")

-- -- ReplicatedStorage/MutationLab/ -- --
local rsFolder = Instance.new("Folder")
rsFolder.Name   = "MutationLab"
rsFolder.Parent = RS

-- Config ModuleScript
local configMS = Instance.new("ModuleScript")
configMS.Name   = "Config"
configMS.Source = [=[
local Config = {}

Config.NUM_PLOTS = 8
Config.MAX_PLAYERS = 8

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

Config.PLOT_RADIUS = 160
Config.PLOT_SIZE = 64
Config.BASE_Y = 10

return Config
]=]
configMS.Parent = rsFolder

-- PlotAssigned RemoteEvent
local plotEvent = Instance.new("RemoteEvent")
plotEvent.Name   = "PlotAssigned"
plotEvent.Parent = rsFolder

print("[MutationLab]   Config + RemoteEvent created in ReplicatedStorage")

-- -- ServerScriptService/MutationLab/ -- --
local sssFolder = Instance.new("Folder")
sssFolder.Name   = "MutationLab"
sssFolder.Parent = SSS

local plotMgrScript = Instance.new("Script")
plotMgrScript.Name   = "PlotManager"
plotMgrScript.Source = [=[
local Players = game:GetService("Players")
local RS = game:GetService("ReplicatedStorage")

local mlFolder     = RS:WaitForChild("MutationLab")
local Config       = require(mlFolder:WaitForChild("Config"))
local PlotAssigned = mlFolder:WaitForChild("PlotAssigned")
local plotsFolder  = workspace:WaitForChild("MutationLab"):WaitForChild("Plots")

local NUM_PLOTS   = Config.NUM_PLOTS
local plots       = {}
local playerPlots = {}

for i = 1, NUM_PLOTS do
	plots[i] = {
		model = plotsFolder:WaitForChild("Plot_" .. i),
		owner = nil,
	}
end
print("[PlotManager] Initialised " .. NUM_PLOTS .. " plots")

local function getSignText(plotIndex, partName)
	local signPart = plots[plotIndex].model:FindFirstChild(partName)
	if not signPart then return nil end
	local gui = signPart:FindFirstChildWhichIsA("SurfaceGui")
	if not gui then return nil end
	return gui:FindFirstChild("SignText")
end

local function updateSign(plotIndex, playerName)
	local status = getSignText(plotIndex, "StatusSign")
	if not status then return end
	if playerName then
		status.Text = playerName
		status.TextColor3 = Color3.fromRGB(0, 255, 120)
	else
		status.Text = "AVAILABLE"
		status.TextColor3 = Color3.fromRGB(100, 220, 160)
	end
end

local function assignPlot(player)
	if playerPlots[player] then
		return playerPlots[player]
	end
	for i = 1, NUM_PLOTS do
		if plots[i].owner == nil then
			plots[i].owner = player
			playerPlots[player] = i
			updateSign(i, player.Name)
			PlotAssigned:FireClient(player, i)
			print("[PlotManager] " .. player.Name .. " -> Plot " .. i)
			return i
		end
	end
	warn("[PlotManager] No plots available for " .. player.Name)
	return nil
end

local function releasePlot(player)
	local idx = playerPlots[player]
	if not idx then return end
	plots[idx].owner = nil
	playerPlots[player] = nil
	updateSign(idx, nil)
	print("[PlotManager] Plot " .. idx .. " released")
end

local function teleportToPlot(character, plotIndex)
	local spawnPart = plots[plotIndex].model:FindFirstChild("PlotSpawn")
	if spawnPart then
		character:PivotTo(spawnPart.CFrame + Vector3.new(0, 3, 0))
	end
end

Players.PlayerAdded:Connect(function(player)
	player.CharacterAdded:Connect(function(character)
		task.wait(0.5)
		local idx = playerPlots[player]
		if not idx then
			idx = assignPlot(player)
		end
		if idx and character.Parent then
			teleportToPlot(character, idx)
		end
	end)
end)

Players.PlayerRemoving:Connect(function(player)
	releasePlot(player)
end)

game:BindToClose(function()
	for _, plotData in pairs(plots) do
		if plotData.owner then
			releasePlot(plotData.owner)
		end
	end
end)
]=]
plotMgrScript.Parent = sssFolder

print("[MutationLab]   PlotManager created in ServerScriptService")

-- -- StarterPlayerScripts/MutationLab/ -- --
if SPS then
	local spsFolder = Instance.new("Folder")
	spsFolder.Name   = "MutationLab"
	spsFolder.Parent = SPS

	local plotUI = Instance.new("LocalScript")
	plotUI.Name   = "PlotUI"
	plotUI.Source = [=[
local Players      = game:GetService("Players")
local TweenService = game:GetService("TweenService")
local RS           = game:GetService("ReplicatedStorage")

local player     = Players.LocalPlayer
local playerGui  = player:WaitForChild("PlayerGui")
local mlFolder   = RS:WaitForChild("MutationLab")
local PlotAssigned = mlFolder:WaitForChild("PlotAssigned")

local gui = Instance.new("ScreenGui")
gui.Name            = "PlotUI"
gui.ResetOnSpawn    = false
gui.ZIndexBehavior  = Enum.ZIndexBehavior.Sibling
gui.Parent          = playerGui

-- Notification banner
local banner = Instance.new("Frame")
banner.Name             = "Banner"
banner.Size             = UDim2.new(0, 340, 0, 52)
banner.Position         = UDim2.new(0.5, -170, 0, -56)
banner.BackgroundColor3 = Color3.fromRGB(12, 12, 22)
banner.BorderSizePixel  = 0
banner.Parent           = gui

local bc = Instance.new("UICorner")
bc.CornerRadius = UDim.new(0, 10)
bc.Parent       = banner

local bs = Instance.new("UIStroke")
bs.Color     = Color3.fromRGB(0, 255, 120)
bs.Thickness = 2
bs.Parent    = banner

local bg = Instance.new("UIGradient")
bg.Color  = ColorSequence.new(
	Color3.fromRGB(0, 255, 120),
	Color3.fromRGB(0, 180, 255)
)
bg.Parent = bs

local bText = Instance.new("TextLabel")
bText.Name                  = "Text"
bText.Size                  = UDim2.new(1, -20, 1, 0)
bText.Position              = UDim2.new(0, 10, 0, 0)
bText.BackgroundTransparency = 1
bText.TextColor3            = Color3.fromRGB(0, 255, 120)
bText.Font                  = Enum.Font.GothamBold
bText.TextSize              = 18
bText.Text                  = ""
bText.Parent                = banner

-- Persistent indicator
local indicator = Instance.new("Frame")
indicator.Name                  = "Indicator"
indicator.Size                  = UDim2.new(0, 160, 0, 30)
indicator.Position              = UDim2.new(0, 10, 0, 10)
indicator.BackgroundColor3      = Color3.fromRGB(12, 12, 22)
indicator.BackgroundTransparency = 0.3
indicator.BorderSizePixel       = 0
indicator.Visible               = false
indicator.Parent                = gui

local ic = Instance.new("UICorner")
ic.CornerRadius = UDim.new(0, 6)
ic.Parent       = indicator

local iStroke = Instance.new("UIStroke")
iStroke.Color     = Color3.fromRGB(0, 200, 100)
iStroke.Thickness = 1
iStroke.Parent    = indicator

local iText = Instance.new("TextLabel")
iText.Size                  = UDim2.new(1, -10, 1, 0)
iText.Position              = UDim2.new(0, 5, 0, 0)
iText.BackgroundTransparency = 1
iText.TextColor3            = Color3.fromRGB(0, 255, 120)
iText.Font                  = Enum.Font.GothamBold
iText.TextSize              = 14
iText.TextXAlignment        = Enum.TextXAlignment.Left
iText.Text                  = ""
iText.Parent                = indicator

local function showBanner(text)
	bText.Text      = text
	banner.Position = UDim2.new(0.5, -170, 0, -56)

	TweenService:Create(banner,
		TweenInfo.new(0.5, Enum.EasingStyle.Back, Enum.EasingDirection.Out),
		{ Position = UDim2.new(0.5, -170, 0, 14) }
	):Play()

	task.delay(3.5, function()
		TweenService:Create(banner,
			TweenInfo.new(0.3, Enum.EasingStyle.Quad, Enum.EasingDirection.In),
			{ Position = UDim2.new(0.5, -170, 0, -56) }
		):Play()
	end)
end

PlotAssigned.OnClientEvent:Connect(function(plotIndex)
	showBanner("Assigned to Lab " .. plotIndex)
	indicator.Visible = true
	iText.Text = "Lab " .. plotIndex
end)
]=]
	plotUI.Parent = spsFolder
	print("[MutationLab]   PlotUI created in StarterPlayerScripts")
else
	warn("[MutationLab] StarterPlayerScripts not found — PlotUI skipped")
end

-- ================================================================
--  DONE
-- ================================================================
print("========================================")
print("[MutationLab] Phase 1 installed!")
print("  Lobby ........... 1")
print("  Plots ........... " .. NUM_PLOTS)
print("  Corridors ....... " .. NUM_PLOTS)
print("  Scripts ......... Config, PlotManager, PlotUI")
print("  Events .......... PlotAssigned")
print("========================================")
print("Press F5 to play-test, or use Test > Local Server for multiplayer.")
print("")
print("TIP: In Edit mode, use Ctrl+Shift+F to toggle fullscreen,")
print("     then scroll the mouse wheel to zoom out and see the full map.")
