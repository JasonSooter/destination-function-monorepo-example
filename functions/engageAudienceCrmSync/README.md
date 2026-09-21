# engageAudienceCrmSync

Applies an Engage audience membership change to a CRM: entering the audience
upserts the contact, leaving it removes the contact from the matching list.

`onTrack` and `onIdentify` both handle it, because Engage delivers audience changes
as track events for some audiences and identify events for others. Removals skip
the Profile API entirely — the CRM record is about to stop being synced.

## Settings

| Setting           | Required       | Purpose                                                |
| ----------------- | -------------- | ------------------------------------------------------ |
| `crmBaseUrl`      | yes            | CRM API base URL                                       |
| `crmApiKey`       | yes            | CRM bearer token                                       |
| `audienceKey`     | no             | overrides the key Engage reports in `context.personas` |
| `traitsToReturn`  | no             | extra traits to attach to the upserted contact         |
| `engageSpaceId`   | when enriching | Engage space queried for traits                        |
| `profileApiToken` | when enriching | Profile API access token                               |
