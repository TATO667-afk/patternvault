# Mutation Lab — Phase 1: World & Plot Assignment

## What This Creates

- **Central lobby** with 4 spawn locations, glowing centre column, title sign, corner pillars with purple neon
- **8 laboratory plots** arranged in a ring, each with walls, neon trim, lab number signs, status signs, display slot markers, and a mutation machine placeholder
- **8 corridors** connecting the lobby to each plot, with railings, neon guide strips, and entrance signs
- **Sci-fi lighting** — dark atmosphere, bloom, neon glow, colour correction
- **Plot assignment system** — server assigns one lab per player, teleports on spawn, releases on disconnect
- **Client UI** — animated notification banner + persistent lab indicator

## Installation

### Step 1: Open Roblox Studio

1. Open **Roblox Studio**
2. Create a new **Baseplate** place (File > New > Baseplate)
3. Save it (File > Save to Roblox or Save to File)

### Step 2: Run the Installer

1. Open the **Command Bar**: go to **View > Command Bar** (or press `Alt+F6`)
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

The installer:
- Removes the default Baseplate
- Builds all 3D geometry in `Workspace > MutationLab`
- Creates `ReplicatedStorage > MutationLab` (Config module + PlotAssigned event)
- Creates `ServerScriptService > MutationLab > PlotManager` (server script)
- Creates `StarterPlayer > StarterPlayerScripts > MutationLab > PlotUI` (client script)
- Configures Lighting and post-processing effects

Safe to re-run — it removes the previous installation first.

## Testing

### Single Player (F5)

1. Press **F5** (or Play button)
2. You spawn in the lobby briefly, then get teleported to **Lab 1**
3. A green notification banner slides down: "Assigned to Lab 1"
4. A persistent "Lab 1" indicator appears in the top-left corner
5. The back wall sign reads **LAB 1** with your username underneath
6. Walk around — you can return to the lobby via the corridor
7. If you reset (Esc > Reset), you respawn back at your lab
8. Press **Shift+F5** to stop

### Multiplayer (Local Server)

1. Go to the **Test** tab in the ribbon
2. In the **Clients and Servers** section, set player count to **2** (or up to 8)
3. Click **Start**
4. Studio opens separate windows: one server view and one per client
5. **Check each client**:
   - Each should be assigned a unique lab (Lab 1, Lab 2, etc.)
   - Each should see their own notification banner
   - Lab signs should show each player's name
6. **Close one client window** (simulates disconnect):
   - The server Output should show "Plot X released"
   - The lab sign should reset to "AVAILABLE"
7. Click **Cleanup** to stop all test sessions

### What to Verify

| Feature | Expected Behaviour |
|---|---|
| Spawn | Player appears in lobby, then teleports to assigned lab |
| Unique plots | Each player gets a different lab number |
| Signs | "LAB X" with player name shown on back wall |
| Release | Closing a client resets the lab sign to AVAILABLE |
| Respawn | Resetting character teleports back to own lab |
| UI banner | Green notification slides down from top |
| UI indicator | Persistent "Lab X" label in top-left |
| Lighting | Dark atmosphere with green/purple neon glow |
| Fall safety | Falling off platforms kills and respawns the player |

## Architecture

### Instance Hierarchy

```
Workspace
  MutationLab (Folder)
    Lobby (Folder) — floor, spawns, pillars, signs
    Plots (Folder)
      Plot_1 (Model)
        Floor, BackWall, LeftWall, RightWall, FrontLeft, FrontRight
        BackNeon, LeftNeon, RightNeon, DoorNeonL, DoorNeonR
        LabSign, StatusSign (SurfaceGui with SignText)
        MachineMarker, Slot_1..6, PlotSpawn, LabLight
      Plot_2 ... Plot_8
    Corridors (Folder) — floors, railings, neon strips, entrance signs

ReplicatedStorage
  MutationLab (Folder)
    Config (ModuleScript)
    PlotAssigned (RemoteEvent)

ServerScriptService
  MutationLab (Folder)
    PlotManager (Script)

StarterPlayer/StarterPlayerScripts
  MutationLab (Folder)
    PlotUI (LocalScript)
```

### Scripts

| Script | Type | Location | Purpose |
|---|---|---|---|
| Config | ModuleScript | ReplicatedStorage | Shared tuning values (rarity, currency, layout) |
| PlotManager | Script | ServerScriptService | Assigns plots, teleports, releases, updates signs |
| PlotUI | LocalScript | StarterPlayerScripts | Notification banner + lab indicator HUD |

### Remote Events

| Event | Direction | Payload |
|---|---|---|
| PlotAssigned | Server → Client | `plotIndex: number` |

## File Reference

The `src/` directory contains standalone copies of each script for browsing:

- `src/shared/Config.lua` — game configuration module
- `src/server/PlotManager.lua` — server plot management
- `src/client/PlotUI.lua` — client notification UI

These are identical to the scripts embedded in `Phase1_Installer.lua`.

## Next Steps (Phase 2)

Phase 2 will add:
- Physical mutation machine with ProximityPrompt
- Server-authoritative mutation rolls
- Creature models with procedural geometry
- Mutation animation and rarity reveal VFX

**Wait for confirmation before proceeding to Phase 2.**
