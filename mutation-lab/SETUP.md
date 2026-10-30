# Mutation Lab — Setup Guide

## What This Creates

### Phase 1 — World & Plot Assignment
- **Central lobby** with 4 spawn locations, glowing centre column, title sign, corner pillars with purple neon
- **8 laboratory plots** arranged in a ring, each with walls, neon trim, lab number signs, status signs, display slot markers, and a mutation machine placeholder
- **8 corridors** connecting the lobby to each plot, with railings, neon guide strips, and entrance signs
- **Sci-fi lighting** — dark atmosphere, bloom, neon glow, colour correction
- **Plot assignment system** — server assigns one lab per player, teleports on spawn, releases on disconnect
- **Client UI** — animated notification banner + persistent lab indicator

### Phase 2 — Mutation Machine, Rolls & Creatures
- **Mutation machines** in each plot — neon chamber with transparent walls, glowing core, particle emitter, control panel with ProximityPrompt
- **Server-authoritative rarity rolls** — Common 55%, Rare 25%, Epic 12%, Legendary 6%, Mythic 1.8%, Secret 0.2%
- **Procedural creatures** — generated from seed using ball/block Parts with rarity-based features (crystals, wings, crown, ethereal aura)
- **5-second mutation animation** — color cycling chamber, particles, speed ramp
- **Rarity reveal** — pop-in billboard with rarity name and creature name, fade-out after 4 seconds
- **Currency system** — 100 Mutagen starting balance, 50 per mutation, HUD display with flash effect
- **Display slots** — creatures placed in Slot_1 through Slot_6, colored by rarity

## Installation

### Step 1: Open Roblox Studio

1. Open **Roblox Studio**
2. Create a new **Baseplate** place (File > New > Baseplate)
3. Save it (File > Save to Roblox or Save to File)

### Step 2: Run Phase 1 Installer

1. Open the **Command Bar**: go to **View > Command Bar** (or press `Alt+F6`)
   - The Command Bar is a **thin input strip at the very bottom** of Studio
   - It is NOT the Script Editor (the big code window with line numbers)
2. Open the file `src/Phase1_Installer.lua` from this repository
3. **Select all** and **copy** the entire contents
4. **Click** inside the Command Bar at the bottom of Studio
5. **Paste** and press **Enter**

You should see output in the Output window:

```
[MutationLab] Phase 1 installer starting...
========================================
[MutationLab] Phase 1 installed!
  Lobby ........... 1
  Plots ........... 8
  Corridors ....... 8
  Scripts ......... Config, PlotManager, PlotUI
  Events .......... PlotAssigned
========================================
Press F5 to play-test, or use Test > Local Server for multiplayer.
```

### Step 3: Test Phase 1

Press **F5** to verify Phase 1 works before continuing. You should spawn in the lobby, get teleported to Lab 1, and see the "Assigned to Lab 1" banner.

### Step 4: Run Phase 2 Installer

1. Open the file `src/Phase2_Installer.lua` from this repository
2. **Select all** and **copy** the entire contents
3. **Click** inside the **Command Bar** (same thin strip at the bottom)
4. **Paste** and press **Enter**

You should see:

```
[MutationLab] Phase 2 installer starting...
[MutationLab] Cleaning previous Phase 2...
[MutationLab] Building mutation machines...
[MutationLab]   Machine built in Plot 1
  ...
[MutationLab]   Machine built in Plot 8
[MutationLab] Creating events...
[MutationLab] Updating Config...
[MutationLab] Creating CreatureData...
[MutationLab] Creating CreatureBuilder...
[MutationLab] Creating CurrencyManager...
[MutationLab] Updating PlotManager...
[MutationLab] Creating MutationManager...
[MutationLab] Updating PlotUI...
[MutationLab] Creating MutationClient...
========================================
[MutationLab] Phase 2 installed!
  Mutation Machines .. 8
  New Scripts ........ CreatureData, CreatureBuilder,
                       CurrencyManager, MutationManager,
                       MutationClient
  Updated Scripts .... Config, PlotManager, PlotUI
  New Events ......... MutationStart, MutationResult,
                       CurrencyUpdate
========================================
Press F5 to test! Walk to the machine in your lab and
press E (or tap) to mutate. Costs 50 Mutagen per roll.
```

Both installers are safe to re-run — they clean up previous content first.

## Testing

### Phase 2 Testing (Single Player — F5)

1. Press **F5** (or Play button)
2. You spawn and get teleported to **Lab 1**
3. HUD bar appears in top-left: **"Lab 1"** on the left, **"Mutagen: 100"** on the right
4. Walk up to the **Mutation Machine** (glowing green chamber in your lab)
5. You'll see a ProximityPrompt: **"Mutate"** — press **E** (or tap on mobile)
6. Hold for 0.5 seconds — the mutation begins:
   - The chamber starts **color cycling** through rarity colors (speeds up over 5 seconds)
   - **Particles** swirl inside the chamber
   - Your Mutagen drops from 100 to **50**
7. After 5 seconds, a creature appears in your first display slot:
   - A **rarity popup** appears above the machine (e.g. "COMMON" + creature name)
   - The creature model sits on Slot_1 with a nameplate billboard
   - The popup fades after 4 seconds
8. Mutate again (costs another 50 Mutagen) — creature goes to Slot_2
9. At 0 Mutagen, mutations are blocked (nothing happens when you press E)

### What to Verify

| Feature | Expected Behaviour |
|---|---|
| Machine appearance | Glowing green chamber with control panel, neon rods, particles (off) |
| ProximityPrompt | "Mutate" prompt appears when near the control panel |
| Currency deduction | Mutagen drops by 50 per mutation |
| Animation | Chamber color-cycles with particles for 5 seconds |
| Creature spawn | Procedural creature appears on a display slot |
| Rarity popup | Billboard shows rarity name + creature name above machine |
| Slot filling | First creature goes to Slot_1, second to Slot_2, etc. |
| Slot colors | Each slot tints to the creature's rarity color |
| HUD display | "Lab X" + "Mutagen: N" in top-left corner |
| Currency flash | Mutagen number flashes bright when it changes |
| Cooldown | Can't mutate again for 6 seconds after starting |
| Ownership | Can only mutate in YOUR lab (not other players' labs) |
| No funds | Mutation blocked when Mutagen < 50 |
| Rarity weights | ~55% Common, ~25% Rare, ~12% Epic (test with many rolls) |

### Rarity Visual Guide

| Rarity | Chance | Color | Creature Features |
|---|---|---|---|
| Common | 55% | Grey | Body + eyes only |
| Rare | 25% | Blue | + crystal/spike protrusions |
| Epic | 12% | Purple | + glowing PointLight |
| Legendary | 6% | Gold | + wings |
| Mythic | 1.8% | Red | + floating crown |
| Secret | 0.2% | White | + ethereal aura + particles |

### Multiplayer Testing

1. Go to **Test** tab > set player count to **2** (or more)
2. Click **Start**
3. Each client should:
   - Get assigned a unique lab
   - Start with 100 Mutagen each
   - Only be able to mutate in their OWN lab
   - See creatures in other players' labs when walking by

## Architecture

### Instance Hierarchy

```
Workspace
  MutationLab (Folder)
    Lobby (Folder) — floor, spawns, pillars, signs
    Plots (Folder)
      Plot_1 (Model) [OwnerId attribute]
        Floor, BackWall, LeftWall, RightWall, FrontLeft, FrontRight
        BackNeon, LeftNeon, RightNeon, DoorNeonL, DoorNeonR
        LabSign, StatusSign (SurfaceGui with SignText)
        MutationMachine (Model)
          Base, Pedestal, BottomRing, Chamber, ChamberGlow,
          TopRing, TopCap, Rod_1-4, ControlPanel (SurfaceGui + ProximityPrompt)
          MutationParticles (ParticleEmitter on ChamberGlow)
        Slot_1..6, PlotSpawn, LabLight
      Plot_2 ... Plot_8
    Corridors (Folder) — floors, railings, neon strips, entrance signs

ReplicatedStorage
  MutationLab (Folder)
    Config (ModuleScript)
    CreatureData (ModuleScript)
    CreatureBuilder (ModuleScript)
    PlotAssigned (RemoteEvent)
    MutationStart (RemoteEvent)
    MutationResult (RemoteEvent)
    CurrencyUpdate (RemoteEvent)

ServerScriptService
  MutationLab (Folder)
    PlotManager (Script)
    CurrencyManager (ModuleScript)
    MutationManager (Script)

StarterPlayer/StarterPlayerScripts
  MutationLab (Folder)
    PlotUI (LocalScript)
    MutationClient (LocalScript)
```

### Scripts

| Script | Type | Location | Purpose |
|---|---|---|---|
| Config | ModuleScript | ReplicatedStorage | Shared tuning values (rarity, currency, layout, mutation costs) |
| CreatureData | ModuleScript | ReplicatedStorage | Name generation tables (22 prefixes × 24 suffixes) |
| CreatureBuilder | ModuleScript | ReplicatedStorage | Procedural creature model builder using Parts |
| PlotManager | Script | ServerScriptService | Assigns plots, teleports, releases, updates signs, sets OwnerId |
| CurrencyManager | ModuleScript | ServerScriptService | Server-side balance tracking with client sync |
| MutationManager | Script | ServerScriptService | Mutation machine handler — rolls, cooldowns, creature placement |
| PlotUI | LocalScript | StarterPlayerScripts | HUD bar (lab indicator + currency) + notification banner |
| MutationClient | LocalScript | StarterPlayerScripts | Mutation animation (color cycling) + rarity reveal popup |

### Remote Events

| Event | Direction | Payload |
|---|---|---|
| PlotAssigned | Server → Client | `plotIndex: number` |
| MutationStart | Server → Client | `plotIndex: number, duration: number` |
| MutationResult | Server → Client | `creatureData: table, plotIndex: number` |
| CurrencyUpdate | Server → Client | `amount: number` |

## File Reference

The `src/` directory contains standalone copies of each script for browsing:

- `src/shared/Config.lua` — game configuration module
- `src/shared/CreatureData.lua` — creature name generation data
- `src/shared/CreatureBuilder.lua` — procedural creature model builder
- `src/server/PlotManager.lua` — server plot management
- `src/server/CurrencyManager.lua` — server-side currency tracking
- `src/server/MutationManager.lua` — mutation machine logic
- `src/client/PlotUI.lua` — HUD and notification UI
- `src/client/MutationClient.lua` — mutation animation and reveal

These are identical to the scripts embedded in the installer files.

### Phase 3 — Inventory, Slots & Passive Income
- **Creature inventory** — scrollable panel listing all owned creatures with rarity colors
- **Slot management** — Place/Remove buttons to manage display slots from inventory
- **Passive income** — displayed creatures earn Mutagen every 10 seconds based on rarity
- **Income notifications** — floating "+X Mutagen" text on each income tick
- **Overflow handling** — when all 6 slots are full, new creatures go to inventory with "Open Inventory to place!" prompt
- **Income rate display** — inventory panel header shows total income per tick

## Phase 3 Installation

### Step 5: Run Phase 3 Installer

1. Make sure Phase 1 and Phase 2 are already installed
2. Open `src/Phase3_Installer.lua` from this repository
3. **Select all** → **Copy**
4. **Click** inside the **Command Bar** (thin strip at bottom)
5. **Paste** → press **Enter**

You should see:

```
[MutationLab] Phase 3 installer starting...
[MutationLab] Cleaning previous Phase 3...
[MutationLab] Creating Phase 3 events...
[MutationLab] Updating Config...
[MutationLab] Creating InventoryManager...
[MutationLab] Creating IncomeManager...
[MutationLab] Updating MutationManager...
[MutationLab] Updating PlotUI...
[MutationLab] Updating MutationClient...
[MutationLab] Creating InventoryUI...
========================================
[MutationLab] Phase 3 installed!
  New Scripts ........ InventoryManager, IncomeManager,
                       InventoryUI
  Updated Scripts .... Config, MutationManager,
                       PlotUI, MutationClient
  New Events ......... InventoryUpdate, PlaceRequest,
                       RemoveRequest, IncomeNotify
========================================
```

All installers are safe to re-run. If you re-run Phase 2, re-run Phase 3 after.

### Phase 3 Testing

1. Press **F5**
2. You spawn and teleport to your lab with 100 Mutagen
3. Mutate twice to fill Slot 1 and Slot 2 (costs 100 total)
4. An **"Inventory (2)"** button appears below the HUD
5. Click it — the **inventory panel** slides in from the right
6. You'll see your 2 creatures listed with rarity colors, income values, and "Remove" buttons
7. The header shows **"Income: +X every 10s"** (sum of slotted creature incomes)
8. Wait 10 seconds — you'll see **"+X Mutagen"** float up from the HUD as income arrives
9. Your Mutagen balance increases automatically — mutate again when you can afford it!
10. Fill all 6 slots — the next mutation shows **"Open Inventory to place!"** and the creature goes to your inventory unplaced
11. Open inventory, click **"Remove"** on a creature, then click **"Place"** on the new one to swap

### What to Verify (Phase 3)

| Feature | Expected Behaviour |
|---|---|
| Inventory button | "Inventory (N)" appears below HUD after first mutation |
| Inventory panel | Slides in from right, shows all creatures with rarity colors |
| Place button | Places unslotted creature into next empty display slot |
| Remove button | Removes creature from slot, model disappears, slot resets |
| Income tick | Every 10 seconds, slotted creatures earn Mutagen |
| Income float | "+X Mutagen" text floats up from HUD on income |
| Income rate | Panel header shows total income rate |
| Overflow | 7th+ creatures go to inventory unplaced with yellow prompt |
| Button flash | Inventory button flashes yellow when unplaced creatures exist |
| Panel close | X button or toggle button closes panel |

### Income Per Rarity

| Rarity | Income Per Tick |
|---|---|
| Common | +1 |
| Rare | +3 |
| Epic | +8 |
| Legendary | +20 |
| Mythic | +50 |
| Secret | +150 |

## Architecture

### Instance Hierarchy

```
Workspace
  MutationLab (Folder)
    Lobby (Folder) — floor, spawns, pillars, signs
    Plots (Folder)
      Plot_1 (Model) [OwnerId attribute]
        Floor, BackWall, LeftWall, RightWall, FrontLeft, FrontRight
        BackNeon, LeftNeon, RightNeon, DoorNeonL, DoorNeonR
        LabSign, StatusSign (SurfaceGui with SignText)
        MutationMachine (Model)
          Base, Pedestal, BottomRing, Chamber, ChamberGlow,
          TopRing, TopCap, Rod_1-4, ControlPanel (SurfaceGui + ProximityPrompt)
          MutationParticles (ParticleEmitter on ChamberGlow)
        Slot_1..6, PlotSpawn, LabLight
      Plot_2 ... Plot_8
    Corridors (Folder) — floors, railings, neon strips, entrance signs

ReplicatedStorage
  MutationLab (Folder)
    Config (ModuleScript)
    CreatureData (ModuleScript)
    CreatureBuilder (ModuleScript)
    PlotAssigned (RemoteEvent)
    MutationStart (RemoteEvent)
    MutationResult (RemoteEvent)
    CurrencyUpdate (RemoteEvent)
    InventoryUpdate (RemoteEvent)
    PlaceRequest (RemoteEvent)
    RemoveRequest (RemoteEvent)
    IncomeNotify (RemoteEvent)

ServerScriptService
  MutationLab (Folder)
    PlotManager (Script)
    CurrencyManager (ModuleScript)
    MutationManager (Script)
    InventoryManager (ModuleScript)
    IncomeManager (Script)

StarterPlayer/StarterPlayerScripts
  MutationLab (Folder)
    PlotUI (LocalScript)
    MutationClient (LocalScript)
    InventoryUI (LocalScript)
```

### Scripts

| Script | Type | Location | Purpose |
|---|---|---|---|
| Config | ModuleScript | ReplicatedStorage | Shared tuning values (rarity, currency, layout, mutation, income) |
| CreatureData | ModuleScript | ReplicatedStorage | Name generation tables (22 prefixes × 24 suffixes) |
| CreatureBuilder | ModuleScript | ReplicatedStorage | Procedural creature model builder using Parts |
| PlotManager | Script | ServerScriptService | Assigns plots, teleports, releases, updates signs, sets OwnerId |
| CurrencyManager | ModuleScript | ServerScriptService | Server-side balance tracking with client sync |
| MutationManager | Script | ServerScriptService | Mutation rolls, creature placement, slot place/remove handling |
| InventoryManager | ModuleScript | ServerScriptService | Server-side creature inventory tracking per player |
| IncomeManager | Script | ServerScriptService | Passive income ticker, awards Mutagen based on displayed creatures |
| PlotUI | LocalScript | StarterPlayerScripts | HUD bar (lab + currency), notification banner, income float |
| MutationClient | LocalScript | StarterPlayerScripts | Mutation animation (color cycling) + rarity reveal popup |
| InventoryUI | LocalScript | StarterPlayerScripts | Inventory panel with creature cards and Place/Remove buttons |

### Remote Events

| Event | Direction | Payload |
|---|---|---|
| PlotAssigned | Server → Client | `plotIndex: number` |
| MutationStart | Server → Client | `plotIndex: number, duration: number` |
| MutationResult | Server → Client | `creatureData: table, plotIndex: number` |
| CurrencyUpdate | Server → Client | `amount: number` |
| InventoryUpdate | Server → Client | `inventory: table` |
| PlaceRequest | Client → Server | `creatureId: string, slotIndex?: number` |
| RemoveRequest | Client → Server | `creatureId: string` |
| IncomeNotify | Server → Client | `amount: number` |

## File Reference

The `src/` directory contains standalone copies of each script for browsing:

- `src/shared/Config.lua` — game configuration module
- `src/shared/CreatureData.lua` — creature name generation data
- `src/shared/CreatureBuilder.lua` — procedural creature model builder
- `src/server/PlotManager.lua` — server plot management
- `src/server/CurrencyManager.lua` — server-side currency tracking
- `src/server/MutationManager.lua` — mutation machine + slot management logic
- `src/server/InventoryManager.lua` — server-side creature inventory
- `src/server/IncomeManager.lua` — passive income ticker
- `src/client/PlotUI.lua` — HUD, notification, and income float UI
- `src/client/MutationClient.lua` — mutation animation and rarity reveal
- `src/client/InventoryUI.lua` — inventory panel with slot management

These are identical to the scripts embedded in the installer files.

## Next Steps (Phase 4)

Phase 4 will add:
- Lab upgrades (faster mutation, more slots, income multiplier)
- Upgrade UI and progression system

**Wait for confirmation before proceeding to Phase 4.**
