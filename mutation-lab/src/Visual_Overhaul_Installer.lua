-- ================================================================
-- MUTATION LAB  —  VISUAL OVERHAUL INSTALLER
-- ================================================================
-- Transforms the map to match concept art: floating island, trees,
-- waterfalls, crystals, bright sky, roofs, lanterns, terrain.
-- Run after all phases + Visual Polish. Safe to re-run.
-- Paste into Command Bar and press Enter.
-- ================================================================

print("[MutationLab] Visual Overhaul starting...")

local WS = game:GetService("Workspace")
local Lighting = game:GetService("Lighting")
local RS = game:GetService("ReplicatedStorage")
local SP = game:GetService("StarterPlayer")
local SPS = SP:FindFirstChild("StarterPlayerScripts")

local mlRoot = WS:FindFirstChild("MutationLab")
if not mlRoot then
	error("[MutationLab] Game not found! Run Phase 1 first.")
end
local plotsFolder = mlRoot:FindFirstChild("Plots")
local lobbyFolder = mlRoot:FindFirstChild("Lobby")
local corridorsFolder = mlRoot:FindFirstChild("Corridors")
local spsFolder = SPS and SPS:FindFirstChild("MutationLab")

local NUM_PLOTS = 8
local PLOT_RADIUS = 160
local BASE_Y = 10

-- ================================================================
--  CLEANUP (for re-runs)
-- ================================================================
print("[MutationLab] Cleaning previous overhaul...")
local function cleanTag(tag)
	for _, d in ipairs(mlRoot:GetDescendants()) do
		if d:GetAttribute(tag) then d:Destroy() end
	end
	for _, d in ipairs(WS:GetChildren()) do
		if d:GetAttribute(tag) then d:Destroy() end
	end
end
cleanTag("Overhaul")
-- Remove old ambient FX script (we'll replace it)
if spsFolder then
	local old = spsFolder:FindFirstChild("AmbientFX")
	if old then old:Destroy() end
	old = spsFolder:FindFirstChild("OverhaulFX")
	if old then old:Destroy() end
end
-- Clean lighting overhaul items
for _, c in ipairs(Lighting:GetChildren()) do
	if c:GetAttribute("Overhaul") then c:Destroy() end
end

-- ================================================================
--  HELPERS
-- ================================================================
local function mp(parent, name, size, cf, color, mat, opts)
	local p = Instance.new("Part")
	p.Name = name; p.Anchored = true; p.Size = size; p.CFrame = cf
	p.Color = color; p.Material = mat or Enum.Material.SmoothPlastic
	p.TopSurface = Enum.SurfaceType.Smooth
	p.BottomSurface = Enum.SurfaceType.Smooth
	p:SetAttribute("Overhaul", true)
	if opts then
		if opts.shape then p.Shape = opts.shape end
		if opts.t then p.Transparency = opts.t end
		if opts.cc ~= nil then p.CanCollide = opts.cc end
		if opts.cs ~= nil then p.CastShadow = opts.cs end
	end
	p.Parent = parent
	return p
end

local function plight(parent, color, brightness, range)
	local pl = Instance.new("PointLight")
	pl.Color = color; pl.Brightness = brightness or 1
	pl.Range = range or 30; pl.Shadows = false
	pl:SetAttribute("Overhaul", true)
	pl.Parent = parent
	return pl
end

-- Colors
local C = {
	grass       = Color3.fromRGB(55, 140, 60),
	grassDark   = Color3.fromRGB(40, 110, 45),
	dirt        = Color3.fromRGB(120, 85, 55),
	rock        = Color3.fromRGB(90, 85, 80),
	rockDark    = Color3.fromRGB(65, 60, 55),
	stone       = Color3.fromRGB(140, 135, 128),
	wood        = Color3.fromRGB(130, 90, 50),
	woodDark    = Color3.fromRGB(95, 65, 35),
	treeTrunk   = Color3.fromRGB(110, 75, 40),
	treeLeaf    = Color3.fromRGB(50, 155, 55),
	treeLeafB   = Color3.fromRGB(35, 130, 40),
	treeLeafC   = Color3.fromRGB(70, 170, 65),
	crystal     = Color3.fromRGB(120, 50, 220),
	crystalCyan = Color3.fromRGB(30, 180, 255),
	crystalPink = Color3.fromRGB(220, 50, 180),
	water       = Color3.fromRGB(40, 160, 255),
	waterGlow   = Color3.fromRGB(80, 200, 255),
	roofTop     = Color3.fromRGB(60, 65, 80),
	roofTrim    = Color3.fromRGB(45, 50, 65),
	neonGreen   = Color3.fromRGB(0, 255, 140),
	neonCyan    = Color3.fromRGB(0, 220, 255),
	neonPurple  = Color3.fromRGB(180, 60, 255),
	lantern     = Color3.fromRGB(255, 200, 80),
	lanternWarm = Color3.fromRGB(255, 180, 60),
	sky         = Color3.fromRGB(135, 200, 255),
}

-- ================================================================
--  1. BRIGHT DAYTIME SKY
-- ================================================================
print("[MutationLab] Setting up bright sky...")
Lighting.ClockTime = 14
Lighting.Brightness = 2
Lighting.Ambient = Color3.fromRGB(120, 130, 150)
Lighting.OutdoorAmbient = Color3.fromRGB(100, 110, 130)
Lighting.GlobalShadows = true
Lighting.EnvironmentDiffuseScale = 1
Lighting.EnvironmentSpecularScale = 0.8
Lighting.ColorShift_Bottom = Color3.fromRGB(0, 0, 0)
Lighting.ColorShift_Top = Color3.fromRGB(0, 0, 0)

for _, c in ipairs(Lighting:GetChildren()) do
	if c:GetAttribute("MutationLab") or c:GetAttribute("VisualPolish") then
		if c:IsA("Atmosphere") then
			c.Density = 0.3
			c.Offset = 0.6
			c.Color = Color3.fromRGB(170, 200, 230)
			c.Decay = Color3.fromRGB(130, 160, 200)
			c.Haze = 3
			c.Glare = 0.1
		elseif c:IsA("BloomEffect") then
			c.Intensity = 0.6
			c.Size = 30
			c.Threshold = 0.5
		elseif c:IsA("ColorCorrectionEffect") then
			c.Brightness = 0.05
			c.Contrast = 0.1
			c.Saturation = 0.35
			c.TintColor = Color3.fromRGB(240, 245, 255)
		elseif c:IsA("Sky") then
			c.CelestialBodiesShown = true
			c.StarCount = 0
			c.SkyboxBk = ""
			c.SkyboxDn = ""
			c.SkyboxFt = ""
			c.SkyboxLf = ""
			c.SkyboxRt = ""
			c.SkyboxUp = ""
		elseif c:IsA("DepthOfFieldEffect") then
			c.FarIntensity = 0.04
		elseif c:IsA("SunRaysEffect") then
			c.Intensity = 0.06
			c.Spread = 0.8
		end
	end
end

-- ================================================================
--  2. FLOATING ISLAND BASE
-- ================================================================
print("[MutationLab] Building floating island...")
local islandF = Instance.new("Folder")
islandF.Name = "Island"
islandF:SetAttribute("Overhaul", true)
islandF.Parent = mlRoot

-- Main terrain disc (grass top)
local islandRadius = 260
mp(islandF, "IslandTop",
	Vector3.new(islandRadius * 2, 4, islandRadius * 2),
	CFrame.new(0, BASE_Y - 3, 0),
	C.grass, Enum.Material.Grass)

-- Dirt/rock layer underneath
mp(islandF, "IslandMid",
	Vector3.new(islandRadius * 2 - 20, 12, islandRadius * 2 - 20),
	CFrame.new(0, BASE_Y - 11, 0),
	C.dirt, Enum.Material.Ground)

-- Rocky underside (tapered)
mp(islandF, "IslandBottom1",
	Vector3.new(islandRadius * 1.6, 20, islandRadius * 1.6),
	CFrame.new(0, BASE_Y - 27, 0),
	C.rock, Enum.Material.Slate)

mp(islandF, "IslandBottom2",
	Vector3.new(islandRadius * 1.0, 25, islandRadius * 1.0),
	CFrame.new(0, BASE_Y - 44, 0),
	C.rockDark, Enum.Material.Slate)

-- Narrow bottom tip
mp(islandF, "IslandTip",
	Vector3.new(80, 30, 80),
	CFrame.new(0, BASE_Y - 62, 0),
	C.rockDark, Enum.Material.Slate)

-- ================================================================
--  2b. CRYSTALS UNDERNEATH THE ISLAND
-- ================================================================
print("[MutationLab] Adding crystals under island...")
local crystalData = {
	{pos = Vector3.new(-60, -35, -40), rot = CFrame.Angles(0.3, 0.5, -0.2), sz = Vector3.new(8, 25, 8), col = C.crystal},
	{pos = Vector3.new(50, -40, 30), rot = CFrame.Angles(-0.2, 1.0, 0.15), sz = Vector3.new(6, 20, 6), col = C.crystalCyan},
	{pos = Vector3.new(-30, -30, 60), rot = CFrame.Angles(0.15, -0.3, 0.4), sz = Vector3.new(10, 30, 10), col = C.crystal},
	{pos = Vector3.new(80, -38, -50), rot = CFrame.Angles(-0.3, 0.8, -0.1), sz = Vector3.new(5, 18, 5), col = C.crystalPink},
	{pos = Vector3.new(-80, -42, -70), rot = CFrame.Angles(0.4, -0.6, 0.3), sz = Vector3.new(7, 22, 7), col = C.crystalCyan},
	{pos = Vector3.new(20, -45, -80), rot = CFrame.Angles(-0.15, 0.2, -0.35), sz = Vector3.new(9, 28, 9), col = C.crystal},
	{pos = Vector3.new(-90, -36, 40), rot = CFrame.Angles(0.2, 0.9, 0.1), sz = Vector3.new(6, 16, 6), col = C.crystalPink},
	{pos = Vector3.new(70, -50, 70), rot = CFrame.Angles(-0.1, -0.4, 0.25), sz = Vector3.new(12, 35, 12), col = C.crystal},
	{pos = Vector3.new(-40, -55, -90), rot = CFrame.Angles(0.35, 0.1, -0.4), sz = Vector3.new(8, 24, 8), col = C.crystalCyan},
	{pos = Vector3.new(0, -48, 0), rot = CFrame.Angles(0.1, 0.7, -0.15), sz = Vector3.new(14, 40, 14), col = C.crystal},
	{pos = Vector3.new(110, -33, 0), rot = CFrame.Angles(-0.25, 0.3, 0.5), sz = Vector3.new(5, 15, 5), col = C.crystalCyan},
	{pos = Vector3.new(-110, -35, 10), rot = CFrame.Angles(0.3, -0.7, -0.3), sz = Vector3.new(7, 20, 7), col = C.crystalPink},
}

for ci = 1, #crystalData do
	local cd = crystalData[ci]
	local crystal = mp(islandF, "Crystal_" .. ci,
		cd.sz,
		CFrame.new(cd.pos.X, BASE_Y + cd.pos.Y, cd.pos.Z) * cd.rot,
		cd.col, Enum.Material.Neon, {t = 0.15})
	plight(crystal, cd.col, 1.5, 30)
end

-- ================================================================
--  2c. WATERFALLS ON ISLAND EDGES
-- ================================================================
print("[MutationLab] Adding waterfalls...")
local waterfallAngles = {0, 90, 180, 270, 45, 135, 225, 315}
for wi = 1, #waterfallAngles do
	local a = math.rad(waterfallAngles[wi])
	local dist = islandRadius - 30
	local wx = dist * math.cos(a)
	local wz = dist * math.sin(a)

	-- Waterfall emitter anchor
	local wAnchor = mp(islandF, "Waterfall_" .. wi,
		Vector3.new(12, 2, 4),
		CFrame.new(wx, BASE_Y - 2, wz) * CFrame.Angles(0, -a, 0),
		C.water, Enum.Material.Neon, {t = 0.5, cc = false, cs = false})

	local pe = Instance.new("ParticleEmitter")
	pe.Name = "WaterfallPE"
	pe:SetAttribute("Overhaul", true)
	pe.Color = ColorSequence.new({
		ColorSequenceKeypoint.new(0, C.waterGlow),
		ColorSequenceKeypoint.new(1, C.water),
	})
	pe.Size = NumberSequence.new({
		NumberSequenceKeypoint.new(0, 3),
		NumberSequenceKeypoint.new(0.3, 5),
		NumberSequenceKeypoint.new(1, 2),
	})
	pe.Transparency = NumberSequence.new({
		NumberSequenceKeypoint.new(0, 0.3),
		NumberSequenceKeypoint.new(0.6, 0.5),
		NumberSequenceKeypoint.new(1, 1),
	})
	pe.Lifetime = NumberRange.new(2, 4)
	pe.Rate = 20
	pe.Speed = NumberRange.new(8, 15)
	pe.SpreadAngle = Vector2.new(15, 5)
	pe.Acceleration = Vector3.new(0, -20, 0)
	pe.LightEmission = 0.6
	pe.LightInfluence = 0.3
	pe.Enabled = true
	pe.Parent = wAnchor

	-- Glow pool at edge
	local pool = mp(islandF, "WaterfallPool_" .. wi,
		Vector3.new(16, 0.4, 8),
		CFrame.new(wx, BASE_Y - 1.5, wz) * CFrame.Angles(0, -a, 0),
		C.waterGlow, Enum.Material.Neon, {t = 0.4, cc = false})
	plight(pool, C.waterGlow, 1, 25)
end

-- ================================================================
--  3. TREES
-- ================================================================
print("[MutationLab] Planting trees...")
local function buildTree(parent, pos, scale, leafColor)
	scale = scale or 1
	leafColor = leafColor or C.treeLeaf
	local treeM = Instance.new("Model")
	treeM.Name = "Tree"
	treeM:SetAttribute("Overhaul", true)

	-- Trunk
	local trunk = mp(treeM, "Trunk",
		Vector3.new(2 * scale, 10 * scale, 2 * scale),
		CFrame.new(pos.X, pos.Y + 5 * scale, pos.Z),
		C.treeTrunk, Enum.Material.Wood)
	treeM.PrimaryPart = trunk

	-- Canopy layers (3 spheres stacked)
	local sizes = {8, 10, 7}
	local heights = {9, 12, 15}
	local leafColors = {leafColor, leafColor, Color3.fromRGB(
		math.min(255, math.floor(leafColor.R * 255 + 15)),
		math.min(255, math.floor(leafColor.G * 255 + 10)),
		math.min(255, math.floor(leafColor.B * 255 + 5))
	)}
	for li = 1, 3 do
		mp(treeM, "Canopy_" .. li,
			Vector3.new(sizes[li] * scale, sizes[li] * scale * 0.8, sizes[li] * scale),
			CFrame.new(pos.X, pos.Y + heights[li] * scale, pos.Z),
			leafColors[li], Enum.Material.Grass,
			{shape = Enum.PartType.Ball})
	end

	treeM.Parent = parent
	return treeM
end

-- Tree positions — around the perimeter and between labs
local treePositions = {}
-- Ring of trees around the island edge
for ti = 1, 40 do
	local a = (ti / 40) * math.pi * 2 + math.random() * 0.1
	local dist = islandRadius - 50 + math.random(-20, 20)
	-- Skip if too close to a corridor
	local tooClose = false
	for ci = 1, NUM_PLOTS do
		local ca = math.rad((ci - 1) * 360 / NUM_PLOTS)
		local diff = math.abs(a - ca) % (math.pi * 2)
		if diff < 0.22 or diff > (math.pi * 2 - 0.22) then
			tooClose = true
			break
		end
	end
	if not tooClose then
		table.insert(treePositions, {
			x = dist * math.cos(a),
			z = dist * math.sin(a),
			scale = 0.8 + math.random() * 0.8,
			leaf = ({C.treeLeaf, C.treeLeafB, C.treeLeafC})[math.random(1, 3)],
		})
	end
end
-- Trees between plots (inner ring)
for ti = 1, 20 do
	local a = (ti / 20) * math.pi * 2 + 0.15
	local dist = 70 + math.random(-15, 15)
	local tooClose = false
	for ci = 1, NUM_PLOTS do
		local ca = math.rad((ci - 1) * 360 / NUM_PLOTS)
		local diff = math.abs(a - ca) % (math.pi * 2)
		if diff < 0.3 or diff > (math.pi * 2 - 0.3) then
			tooClose = true
			break
		end
	end
	if not tooClose then
		table.insert(treePositions, {
			x = dist * math.cos(a),
			z = dist * math.sin(a),
			scale = 0.6 + math.random() * 0.5,
			leaf = ({C.treeLeaf, C.treeLeafB, C.treeLeafC})[math.random(1, 3)],
		})
	end
end

for _, t in ipairs(treePositions) do
	buildTree(islandF, Vector3.new(t.x, BASE_Y + 1, t.z), t.scale, t.leaf)
end
print("[MutationLab]   " .. #treePositions .. " trees planted")

-- ================================================================
--  4. LAB ROOFS
-- ================================================================
print("[MutationLab] Adding lab roofs...")
if plotsFolder then
	for i = 1, NUM_PLOTS do
		local plot = plotsFolder:FindFirstChild("Plot_" .. i)
		if not plot then continue end
		local floor = plot:FindFirstChild("Floor")
		if not floor then continue end
		local pcf = floor.CFrame

		-- Flat roof slab
		mp(plot, "Roof",
			Vector3.new(66, 2, 66),
			pcf * CFrame.new(0, 20, 0),
			C.roofTop, Enum.Material.SmoothPlastic)

		-- Roof overhang trim (neon edge)
		mp(plot, "RoofTrimF",
			Vector3.new(68, 0.6, 1),
			pcf * CFrame.new(0, 19, -33),
			C.neonGreen, Enum.Material.Neon)
		mp(plot, "RoofTrimB",
			Vector3.new(68, 0.6, 1),
			pcf * CFrame.new(0, 19, 33),
			C.neonGreen, Enum.Material.Neon)
		mp(plot, "RoofTrimL",
			Vector3.new(1, 0.6, 68),
			pcf * CFrame.new(-33, 19, 0),
			C.neonPurple, Enum.Material.Neon)
		mp(plot, "RoofTrimR",
			Vector3.new(1, 0.6, 68),
			pcf * CFrame.new(33, 19, 0),
			C.neonPurple, Enum.Material.Neon)

		-- Roof light (bright downward light inside)
		local roofLight = mp(plot, "RoofLight",
			Vector3.new(6, 1, 6),
			pcf * CFrame.new(0, 19, 0),
			C.neonCyan, Enum.Material.Neon, {t = 0.3, cc = false})
		plight(roofLight, Color3.fromRGB(200, 240, 255), 3, 70)

		-- Skylight accent
		mp(plot, "Skylight",
			Vector3.new(10, 0.3, 10),
			pcf * CFrame.new(0, 20.15, 0),
			C.neonCyan, Enum.Material.Neon, {t = 0.5, cc = false})

		-- Corner pillars to support roof
		local corners = {{-1, -1}, {1, -1}, {-1, 1}, {1, 1}}
		for ci = 1, 4 do
			local cx = corners[ci][1] * 30
			local cz = corners[ci][2] * 30
			mp(plot, "RoofPillar_" .. ci,
				Vector3.new(2.5, 18, 2.5),
				pcf * CFrame.new(cx, 10, cz),
				C.stone, Enum.Material.Concrete)
		end
	end
end

-- ================================================================
--  5. CENTRAL TOWER
-- ================================================================
print("[MutationLab] Building central tower...")
if lobbyFolder then
	-- Tower base (stone)
	mp(lobbyFolder, "TowerBase",
		Vector3.new(20, 8, 20),
		CFrame.new(0, BASE_Y + 5, 0),
		C.stone, Enum.Material.Concrete)

	-- Tower mid section
	mp(lobbyFolder, "TowerMid",
		Vector3.new(14, 20, 14),
		CFrame.new(0, BASE_Y + 19, 0),
		C.roofTop, Enum.Material.SmoothPlastic)

	-- Tower top (wider cap)
	mp(lobbyFolder, "TowerTop",
		Vector3.new(18, 4, 18),
		CFrame.new(0, BASE_Y + 31, 0),
		C.roofTrim, Enum.Material.SmoothPlastic)

	-- Neon rings on tower
	mp(lobbyFolder, "TowerRing1",
		Vector3.new(16, 0.8, 16),
		CFrame.new(0, BASE_Y + 12, 0),
		C.neonGreen, Enum.Material.Neon)
	mp(lobbyFolder, "TowerRing2",
		Vector3.new(15, 0.8, 15),
		CFrame.new(0, BASE_Y + 22, 0),
		C.neonPurple, Enum.Material.Neon)
	mp(lobbyFolder, "TowerRing3",
		Vector3.new(20, 0.8, 20),
		CFrame.new(0, BASE_Y + 33, 0),
		C.neonCyan, Enum.Material.Neon)

	-- Giant glowing chamber on top
	local chamber = mp(lobbyFolder, "TowerChamber",
		Vector3.new(8, 14, 8),
		CFrame.new(0, BASE_Y + 42, 0),
		C.neonGreen, Enum.Material.Neon, {t = 0.3})
	plight(chamber, C.neonGreen, 6, 150)

	-- Chamber glass shell
	mp(lobbyFolder, "TowerGlass",
		Vector3.new(10, 16, 10),
		CFrame.new(0, BASE_Y + 42, 0),
		Color3.fromRGB(180, 240, 200), Enum.Material.Glass, {t = 0.6})

	-- Tower spire
	mp(lobbyFolder, "TowerSpire",
		Vector3.new(2, 8, 2),
		CFrame.new(0, BASE_Y + 53, 0),
		C.neonGreen, Enum.Material.Neon)

	-- Big "MUTATION LAB" sign (wider, on tower)
	-- Remove old title parts
	local oldTitle = lobbyFolder:FindFirstChild("Title")
	if oldTitle then oldTitle.Transparency = 1 end
	local oldSub = lobbyFolder:FindFirstChild("Subtitle")
	if oldSub then oldSub.Transparency = 1 end

	local signBack = mp(lobbyFolder, "BigSign",
		Vector3.new(50, 12, 2),
		CFrame.new(0, BASE_Y + 40, -12),
		Color3.fromRGB(20, 25, 40), Enum.Material.SmoothPlastic)
	local sg = Instance.new("SurfaceGui")
	sg.Face = Enum.NormalId.Front; sg.LightInfluence = 0
	sg:SetAttribute("Overhaul", true); sg.Parent = signBack
	local titleLbl = Instance.new("TextLabel")
	titleLbl.Size = UDim2.new(1, 0, 0.55, 0)
	titleLbl.BackgroundTransparency = 1
	titleLbl.TextColor3 = C.neonGreen
	titleLbl.Font = Enum.Font.GothamBold; titleLbl.TextScaled = true
	titleLbl.Text = "MUTATION"; titleLbl.Parent = sg
	local titleLbl2 = Instance.new("TextLabel")
	titleLbl2.Size = UDim2.new(1, 0, 0.45, 0); titleLbl2.Position = UDim2.new(0, 0, 0.55, 0)
	titleLbl2.BackgroundTransparency = 1
	titleLbl2.TextColor3 = C.neonGreen
	titleLbl2.Font = Enum.Font.GothamBold; titleLbl2.TextScaled = true
	titleLbl2.Text = "LAB"; titleLbl2.Parent = sg
	-- Back face
	local sg2 = Instance.new("SurfaceGui")
	sg2.Face = Enum.NormalId.Back; sg2.LightInfluence = 0
	sg2:SetAttribute("Overhaul", true); sg2.Parent = signBack
	local t2a = titleLbl:Clone(); t2a.Parent = sg2
	local t2b = titleLbl2:Clone(); t2b.Parent = sg2

	-- Sign neon frame
	mp(lobbyFolder, "SignFrameTop",
		Vector3.new(52, 0.5, 2.5),
		CFrame.new(0, BASE_Y + 46.2, -12),
		C.neonGreen, Enum.Material.Neon)
	mp(lobbyFolder, "SignFrameBot",
		Vector3.new(52, 0.5, 2.5),
		CFrame.new(0, BASE_Y + 34, -12),
		C.neonPurple, Enum.Material.Neon)
end

-- ================================================================
--  6. CORRIDOR LANTERNS + FENCES
-- ================================================================
print("[MutationLab] Adding lanterns and fence posts...")
if corridorsFolder then
	for i = 1, NUM_PLOTS do
		local ang = math.rad((i - 1) * 360 / NUM_PLOTS)
		local dx = math.cos(ang)
		local dz = math.sin(ang)
		local lobbyHalf = 40
		local plotHalf = 32
		local corrLen = PLOT_RADIUS - plotHalf - lobbyHalf
		local corrDist = lobbyHalf + corrLen / 2
		local mid = Vector3.new(dx * corrDist, BASE_Y, dz * corrDist)
		local cf = CFrame.lookAt(mid, Vector3.new(0, BASE_Y, 0))
		local corrW = 16

		-- Lanterns along corridor (4 per side)
		for li = 1, 4 do
			local along = (li / 5 - 0.5) * corrLen
			for _, side in ipairs({-1, 1}) do
				local lx = side * (corrW / 2 - 0.5)
				local lcf = cf * CFrame.new(lx, 0, along)
				-- Post
				mp(corridorsFolder, "LanternPost_" .. i .. "_" .. li .. "_" .. side,
					Vector3.new(0.8, 6, 0.8),
					lcf * CFrame.new(0, 4, 0),
					C.wood, Enum.Material.Wood)
				-- Lantern head
				local head = mp(corridorsFolder, "LanternHead_" .. i .. "_" .. li .. "_" .. side,
					Vector3.new(1.8, 1.8, 1.8),
					lcf * CFrame.new(0, 7.5, 0),
					C.lantern, Enum.Material.Neon, {t = 0.15})
				plight(head, C.lanternWarm, 1.2, 22)
			end
		end
	end
end

-- ================================================================
--  7. GRASS PATCHES AND BUSHES
-- ================================================================
print("[MutationLab] Adding grass and bushes...")

-- Bushes near labs (small green spheres)
local function addBush(parent, pos, size, color)
	mp(parent, "Bush",
		Vector3.new(size, size * 0.7, size),
		CFrame.new(pos.X, pos.Y + size * 0.25, pos.Z),
		color or C.treeLeaf, Enum.Material.Grass,
		{shape = Enum.PartType.Ball, cc = false})
end

-- Scatter bushes around lobbby
if lobbyFolder then
	local bushSpots = {
		Vector3.new(30, BASE_Y + 1, 25), Vector3.new(-28, BASE_Y + 1, 30),
		Vector3.new(35, BASE_Y + 1, -20), Vector3.new(-32, BASE_Y + 1, -28),
		Vector3.new(20, BASE_Y + 1, 35), Vector3.new(-25, BASE_Y + 1, -35),
	}
	for _, bs in ipairs(bushSpots) do
		addBush(lobbyFolder, bs, 3 + math.random() * 2, ({C.treeLeaf, C.treeLeafB, C.treeLeafC})[math.random(1, 3)])
	end
end

-- ================================================================
--  8. SURFACE UPGRADES — Lab floors get texture
-- ================================================================
print("[MutationLab] Upgrading surface materials...")

-- Lobby floor: stone/concrete look
if lobbyFolder then
	local lf = lobbyFolder:FindFirstChild("Floor")
	if lf then
		lf.Material = Enum.Material.Concrete
		lf.Color = Color3.fromRGB(110, 115, 130)
	end
end

-- Corridor floors: wooden planks
if corridorsFolder then
	for _, p in ipairs(corridorsFolder:GetChildren()) do
		if p:IsA("BasePart") and p.Name:match("^Floor_") then
			p.Material = Enum.Material.Wood
			p.Color = Color3.fromRGB(130, 100, 65)
		elseif p:IsA("BasePart") and p.Name:match("^Rail") then
			p.Material = Enum.Material.Wood
			p.Color = C.woodDark
		end
	end
end

-- Plot walls: concrete texture
if plotsFolder then
	for i = 1, 8 do
		local plot = plotsFolder:FindFirstChild("Plot_" .. i)
		if not plot then continue end
		for _, p in ipairs(plot:GetChildren()) do
			if p:IsA("BasePart") then
				if p.Name:match("Wall") and p.Material ~= Enum.Material.Neon then
					p.Material = Enum.Material.Concrete
					p.Color = Color3.fromRGB(115, 120, 140)
				elseif p.Name == "Floor" then
					p.Material = Enum.Material.Concrete
					p.Color = Color3.fromRGB(100, 105, 125)
				end
			end
		end
	end
end

-- ================================================================
--  9. AMBIENT FX SCRIPT (replaces old one)
-- ================================================================
print("[MutationLab] Creating overhaul FX script...")
if spsFolder then
	local fxScript = Instance.new("LocalScript")
	fxScript.Name = "OverhaulFX"
	fxScript.Source = [=[
local TS = game:GetService("TweenService")
local RS = game:GetService("RunService")
local mlRoot = workspace:WaitForChild("MutationLab")
local lobbyF = mlRoot:FindFirstChild("Lobby")
local plotsF = mlRoot:FindFirstChild("Plots")

local elapsed = 0

-- Collect pulsable neon
local neonParts = {}
for _, d in ipairs(mlRoot:GetDescendants()) do
	if d:IsA("BasePart") and d.Material == Enum.Material.Neon and d.Transparency < 0.85 then
		table.insert(neonParts, {
			part = d,
			baseT = d.Transparency,
			phase = math.random() * math.pi * 2,
			speed = 0.3 + math.random() * 0.5,
		})
	end
end

-- Tower chamber
local towerChamber = lobbyF and lobbyF:FindFirstChild("TowerChamber")
local towerLight = towerChamber and towerChamber:FindFirstChildOfClass("PointLight")

RS.Heartbeat:Connect(function(dt)
	elapsed = elapsed + dt

	-- Subtle neon pulse
	for _, data in ipairs(neonParts) do
		local wave = math.sin(elapsed * data.speed + data.phase) * 0.06
		data.part.Transparency = math.clamp(data.baseT + wave, 0, 0.9)
	end

	-- Tower chamber color cycle
	if towerChamber then
		local hue = (elapsed * 0.03) % 1
		local r = math.floor(math.clamp(math.sin(hue * 6.28 + 2) * 40, 0, 60))
		local g = math.floor(200 + math.sin(hue * 6.28) * 55)
		local b = math.floor(130 + math.sin(hue * 6.28 + 1) * 70)
		towerChamber.Color = Color3.fromRGB(r, g, b)
	end
	if towerLight then
		towerLight.Brightness = 5 + math.sin(elapsed * 0.7) * 2
	end
end)

-- Lab ceiling lights: warm color cycle
if plotsF then
	for i = 1, 8 do
		local plot = plotsF:FindFirstChild("Plot_" .. i)
		if not plot then continue end
		local roofLight = plot:FindFirstChild("RoofLight")
		if roofLight then
			task.spawn(function()
				while roofLight.Parent do
					TS:Create(roofLight, TweenInfo.new(4, Enum.EasingStyle.Sine, Enum.EasingDirection.InOut), {
						Color = Color3.fromRGB(0, 200, 255),
					}):Play()
					task.wait(4)
					TS:Create(roofLight, TweenInfo.new(4, Enum.EasingStyle.Sine, Enum.EasingDirection.InOut), {
						Color = Color3.fromRGB(0, 255, 160),
					}):Play()
					task.wait(4)
				end
			end)
		end

		-- Idle machine glow pulse
		local machine = plot:FindFirstChild("MutationMachine")
		if machine then
			local cg = machine:FindFirstChild("ChamberGlow")
			if cg then
				task.spawn(function()
					while cg.Parent do
						TS:Create(cg, TweenInfo.new(2.5, Enum.EasingStyle.Sine, Enum.EasingDirection.InOut), {
							Transparency = 0.2,
						}):Play()
						task.wait(2.5)
						TS:Create(cg, TweenInfo.new(2.5, Enum.EasingStyle.Sine, Enum.EasingDirection.InOut), {
							Transparency = 0.5,
						}):Play()
						task.wait(2.5)
					end
				end)
			end
		end
	end
end

-- Waterfall pool glow pulse
local island = mlRoot:FindFirstChild("Island")
if island then
	for _, p in ipairs(island:GetChildren()) do
		if p.Name:match("^WaterfallPool_") then
			task.spawn(function()
				while p.Parent do
					TS:Create(p, TweenInfo.new(2, Enum.EasingStyle.Sine, Enum.EasingDirection.InOut), {
						Transparency = 0.25,
					}):Play()
					task.wait(2)
					TS:Create(p, TweenInfo.new(2, Enum.EasingStyle.Sine, Enum.EasingDirection.InOut), {
						Transparency = 0.55,
					}):Play()
					task.wait(2)
				end
			end)
		end
	end
end

print("[OverhaulFX] Visual effects active")
]=]
	fxScript.Parent = spsFolder
end

-- ================================================================
--  DONE
-- ================================================================
print("========================================")
print("[MutationLab] Visual Overhaul complete!")
print("  Floating Island ... Grass top, rock underside, tapered tip")
print("  Crystals .......... 12 glowing crystals underneath")
print("  Waterfalls ........ 8 flowing water edges with glow pools")
print("  Trees ............. " .. #treePositions .. " procedural trees")
print("  Lab Roofs ......... 8 roofs with neon trim + skylights")
print("  Central Tower ..... Multi-tier tower with glass chamber")
print("  Lanterns .......... Warm lantern posts along corridors")
print("  Materials ......... Concrete walls, wood corridors, grass")
print("  Sky ............... Bright daytime, clouds, sun rays")
print("  Animations ........ Pulsing neon, cycling lights, waterfalls")
print("========================================")
print("Press F5 to see the transformation!")
