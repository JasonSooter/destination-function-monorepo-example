# triggeredEmailSend

Requests a marketing triggered send when a qualifying event arrives.

Triggered sends interpolate profile traits into the email template, so a send
issued before those traits are computed produces a broken email. `requireTraits`
draws the distinction that matters: a trait that is **undefined** has not been
computed yet and is transient, so the event is retried; a trait that is **null** is
a real answer, so the send is skipped rather than retried forever.

## Settings

| Setting           | Required       | Purpose                                  |
| ----------------- | -------------- | ---------------------------------------- |
| `marketingApiUrl` | yes            | marketing platform API base URL          |
| `templateId`      | yes            | template to send                         |
| `marketingApiKey` | yes            | marketing platform bearer token          |
| `triggerEvents`   | yes            | event names that trigger a send          |
| `requiredTraits`  | no             | traits the template needs before sending |
| `engageSpaceId`   | when enriching | Engage space queried for traits          |
| `profileApiToken` | when enriching | Profile API access token                 |
