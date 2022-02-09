let hudTick;

/**
 * Hide hud
 */
function onHudTick()
{
	for (let i = 1; i < 22; i++)
	{
		HideHudComponentThisFrame(i);
	}

	HideHudAndRadarThisFrame();
	RemoveMultiplayerHudCash();
	ThefeedHideThisFrame();
}