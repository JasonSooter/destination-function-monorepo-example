# profileEnrichedWebhook

Forwards a track event to a customer webhook, enriched with the Engage traits the
receiving system needs. The canonical Profile-API enrichment pattern.

Traits are sent under their own `traits` key rather than merged into `properties`,
so an audience trait can never silently overwrite an event property of the same
name.

## Settings

| Setting           | Required       | Purpose                                           |
| ----------------- | -------------- | ------------------------------------------------- |
| `webhookUrl`      | yes            | destination for the enriched payload              |
| `traitsToReturn`  | no             | trait names to fetch; empty skips the Profile API |
| `engageSpaceId`   | when enriching | Engage space queried for traits                   |
| `profileApiToken` | when enriching | Profile API access token                          |
