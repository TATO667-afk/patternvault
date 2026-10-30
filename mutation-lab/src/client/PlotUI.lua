-- LocalScript: StarterPlayer/StarterPlayerScripts/MutationLab/PlotUI
-- Shows a slide-down banner on plot assignment and a persistent lab indicator.

local Players = game:GetService("Players")
local TweenService = game:GetService("TweenService")
local RS = game:GetService("ReplicatedStorage")

local player = Players.LocalPlayer
local playerGui = player:WaitForChild("PlayerGui")
local mlFolder = RS:WaitForChild("MutationLab")
local PlotAssigned = mlFolder:WaitForChild("PlotAssigned")

----------------------------------------------------------------
-- Screen GUI
----------------------------------------------------------------
local gui = Instance.new("ScreenGui")
gui.Name = "PlotUI"
gui.ResetOnSpawn = false
gui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling
gui.Parent = playerGui

----------------------------------------------------------------
-- Notification banner (slides from top)
----------------------------------------------------------------
local banner = Instance.new("Frame")
banner.Name = "Banner"
banner.Size = UDim2.new(0, 340, 0, 52)
banner.Position = UDim2.new(0.5, -170, 0, -56)
banner.BackgroundColor3 = Color3.fromRGB(12, 12, 22)
banner.BorderSizePixel = 0
banner.Parent = gui

local bCorner = Instance.new("UICorner")
bCorner.CornerRadius = UDim.new(0, 10)
bCorner.Parent = banner

local bStroke = Instance.new("UIStroke")
bStroke.Color = Color3.fromRGB(0, 255, 120)
bStroke.Thickness = 2
bStroke.Parent = banner

local bGradient = Instance.new("UIGradient")
bGradient.Color = ColorSequence.new(
	Color3.fromRGB(0, 255, 120),
	Color3.fromRGB(0, 180, 255)
)
bGradient.Parent = bStroke

local bText = Instance.new("TextLabel")
bText.Name = "Text"
bText.Size = UDim2.new(1, -20, 1, 0)
bText.Position = UDim2.new(0, 10, 0, 0)
bText.BackgroundTransparency = 1
bText.TextColor3 = Color3.fromRGB(0, 255, 120)
bText.Font = Enum.Font.GothamBold
bText.TextSize = 18
bText.Text = ""
bText.Parent = banner

----------------------------------------------------------------
-- Persistent lab indicator (top-left)
----------------------------------------------------------------
local indicator = Instance.new("Frame")
indicator.Name = "Indicator"
indicator.Size = UDim2.new(0, 160, 0, 30)
indicator.Position = UDim2.new(0, 10, 0, 10)
indicator.BackgroundColor3 = Color3.fromRGB(12, 12, 22)
indicator.BackgroundTransparency = 0.3
indicator.BorderSizePixel = 0
indicator.Visible = false
indicator.Parent = gui

local iCorner = Instance.new("UICorner")
iCorner.CornerRadius = UDim.new(0, 6)
iCorner.Parent = indicator

local iStroke = Instance.new("UIStroke")
iStroke.Color = Color3.fromRGB(0, 200, 100)
iStroke.Thickness = 1
iStroke.Parent = indicator

local iText = Instance.new("TextLabel")
iText.Size = UDim2.new(1, -10, 1, 0)
iText.Position = UDim2.new(0, 5, 0, 0)
iText.BackgroundTransparency = 1
iText.TextColor3 = Color3.fromRGB(0, 255, 120)
iText.Font = Enum.Font.GothamBold
iText.TextSize = 14
iText.TextXAlignment = Enum.TextXAlignment.Left
iText.Text = ""
iText.Parent = indicator

----------------------------------------------------------------
-- Animation
----------------------------------------------------------------
local function showBanner(text: string)
	bText.Text = text
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

----------------------------------------------------------------
-- Listen for plot assignment
----------------------------------------------------------------
PlotAssigned.OnClientEvent:Connect(function(plotIndex: number)
	showBanner("Assigned to Lab " .. plotIndex)
	indicator.Visible = true
	iText.Text = "Lab " .. plotIndex
end)
