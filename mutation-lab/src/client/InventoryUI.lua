-- LocalScript: StarterPlayer/StarterPlayerScripts/MutationLab/InventoryUI
-- Creature inventory panel with slot placement/removal controls.

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
-- Toggle Button
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
-- Panel
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

local incLabel = Instance.new("TextLabel")
incLabel.Size=UDim2.new(1,-20,0,20)
incLabel.Position=UDim2.new(0,10,0,44)
incLabel.BackgroundTransparency=1
incLabel.TextColor3=Color3.fromRGB(0,200,100)
incLabel.Font=Enum.Font.Gotham; incLabel.TextSize=12
incLabel.TextXAlignment=Enum.TextXAlignment.Left
incLabel.Text="Income: +0 every 10s"; incLabel.Parent=panel

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
	card.Name="Card_"..(cData.id or "")
	card.Size=UDim2.new(1,-6,0,62)
	card.BackgroundColor3=Color3.fromRGB(22,22,38)
	card.BorderSizePixel=0
	card.LayoutOrder=order; card.Parent=scroll
	Instance.new("UICorner",card).CornerRadius=UDim.new(0,6)

	local bar = Instance.new("Frame")
	bar.Size=UDim2.new(0,4,1,-6); bar.Position=UDim2.new(0,3,0,3)
	bar.BackgroundColor3=COLORS[cData.rarityIndex] or Color3.new(0.5,0.5,0.5)
	bar.BorderSizePixel=0; bar.Parent=card
	Instance.new("UICorner",bar).CornerRadius=UDim.new(0,2)

	local nm = Instance.new("TextLabel")
	nm.Size=UDim2.new(1,-86,0,22); nm.Position=UDim2.new(0,14,0,4)
	nm.BackgroundTransparency=1
	nm.TextColor3=COLORS[cData.rarityIndex] or Color3.new(1,1,1)
	nm.Font=Enum.Font.GothamBold; nm.TextSize=13
	nm.TextXAlignment=Enum.TextXAlignment.Left
	nm.TextTruncate=Enum.TextTruncate.AtEnd
	nm.Text=cData.name; nm.Parent=card

	local slotStr = cData.slotIndex and ("Slot "..cData.slotIndex) or "Unplaced"
	local info = Instance.new("TextLabel")
	info.Size=UDim2.new(1,-86,0,18); info.Position=UDim2.new(0,14,0,26)
	info.BackgroundTransparency=1
	info.TextColor3=Color3.fromRGB(140,160,150)
	info.Font=Enum.Font.Gotham; info.TextSize=11
	info.TextXAlignment=Enum.TextXAlignment.Left
	info.Text=cData.rarity.." · +"..cData.income.."/tick · "..slotStr
	info.Parent=card

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
		if child:IsA("Frame") or child:IsA("TextLabel") then child:Destroy() end
	end
	toggleBtn.Text="Inventory ("..#inventory..")"
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

InventoryUpdate.OnClientEvent:Connect(function(data)
	inventory = data or {}
	toggleBtn.Visible = true
	refreshUI()
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
