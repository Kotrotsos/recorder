| table_name     | column_name                      | data_type                | is_nullable | column_default    |
| -------------- | -------------------------------- | ------------------------ | ----------- | ----------------- |
| analyses       | id                               | uuid                     | NO          | gen_random_uuid() |
| analyses       | user_id                          | uuid                     | NO          | null              |
| analyses       | transcription_id                 | uuid                     | NO          | null              |
| analyses       | title                            | text                     | NO          | null              |
| analyses       | content                          | text                     | NO          | null              |
| analyses       | analysis_type                    | text                     | NO          | null              |
| analyses       | metadata                         | jsonb                    | YES         | '{}'::jsonb       |
| analyses       | created_at                       | timestamp with time zone | NO          | now()             |
| analyses       | updated_at                       | timestamp with time zone | NO          | now()             |
| files          | id                               | uuid                     | NO          | gen_random_uuid() |
| files          | user_id                          | uuid                     | NO          | null              |
| files          | filename                         | text                     | NO          | null              |
| files          | file_path                        | text                     | NO          | null              |
| files          | file_size                        | bigint                   | NO          | null              |
| files          | mime_type                        | text                     | NO          | null              |
| files          | created_at                       | timestamp with time zone | NO          | now()             |
| files          | updated_at                       | timestamp with time zone | NO          | now()             |
| profiles       | id                               | uuid                     | NO          | null              |
| profiles       | email                            | text                     | NO          | null              |
| profiles       | full_name                        | text                     | YES         | null              |
| profiles       | avatar_url                       | text                     | YES         | null              |
| profiles       | created_at                       | timestamp with time zone | NO          | now()             |
| profiles       | updated_at                       | timestamp with time zone | NO          | now()             |
| subscriptions  | id                               | uuid                     | NO          | gen_random_uuid() |
| subscriptions  | user_id                          | uuid                     | NO          | null              |
| subscriptions  | plan_id                          | text                     | NO          | null              |
| subscriptions  | status                           | text                     | NO          | null              |
| subscriptions  | current_period_start             | timestamp with time zone | NO          | null              |
| subscriptions  | current_period_end               | timestamp with time zone | NO          | null              |
| subscriptions  | cancel_at_period_end             | boolean                  | YES         | false             |
| subscriptions  | payment_provider                 | text                     | YES         | null              |
| subscriptions  | payment_provider_subscription_id | text                     | YES         | null              |
| subscriptions  | metadata                         | jsonb                    | YES         | '{}'::jsonb       |
| subscriptions  | created_at                       | timestamp with time zone | NO          | now()             |
| subscriptions  | updated_at                       | timestamp with time zone | NO          | now()             |
| transcriptions | id                               | uuid                     | NO          | gen_random_uuid() |
| transcriptions | user_id                          | uuid                     | NO          | null              |
| transcriptions | file_id                          | uuid                     | NO          | null              |
| transcriptions | title                            | text                     | NO          | null              |
| transcriptions | content                          | text                     | NO          | null              |
| transcriptions | duration                         | integer                  | YES         | null              |
| transcriptions | language                         | text                     | YES         | 'en'::text        |
| transcriptions | status                           | text                     | YES         | 'completed'::text |
| transcriptions | metadata                         | jsonb                    | YES         | '{}'::jsonb       |
| transcriptions | created_at                       | timestamp with time zone | NO          | now()             |
| transcriptions | updated_at                       | timestamp with time zone | NO          | now()             |
| vibeContext    | id                               | bigint                   | NO          | null              |
| vibeContext    | created_at                       | timestamp with time zone | NO          | now()             |
| vibeContext    | task                             | text                     | YES         | null              |