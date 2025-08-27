-- Clean out existing questions and categories, then create a single exam category and insert the 10 provided questions
BEGIN;

-- Remove all existing questions first (in case of FK-like dependencies)
DELETE FROM public.questions;

-- Remove all existing categories to avoid duplicates and ensure a single exam category remains
DELETE FROM public.exam_categories;

-- Create the single category for this exam and capture its id
WITH new_cat AS (
  INSERT INTO public.exam_categories (name, description)
  VALUES ('GCP Practice Exam', 'Single exam with 10 curated questions')
  RETURNING id
)
-- Insert questions referencing the new category
INSERT INTO public.questions (
  question_text, choice_a, choice_b, choice_c, choice_d, correct_answer, explanation, category_id
)
SELECT q.question_text, q.choice_a, q.choice_b, q.choice_c, q.choice_d, q.correct_answer, q.explanation, (SELECT id FROM new_cat)
FROM (
  VALUES
  (
    'Your company''s test suite is a custom C++ application that runs tests throughout each day on Linux virtual machines. The full test suite takes several hours to complete, running on a limited number of on‑premises servers reserved for testing. Your company wants to move the testing infrastructure to the cloud to reduce the total test time, while changing the tests as little as possible. Which cloud infrastructure should you recommend?',
    'Google Compute Engine unmanaged instance groups and Network Load Balancer',
    'Google Compute Engine managed instance groups with auto-scaling',
    'Google Cloud Dataproc to run Apache Hadoop jobs to process each test',
    'Google App Engine with Google Cloud Logging (Stackdriver)',
    'B',
    'Use Compute Engine managed instance groups with autoscaling to run more VMs in parallel and reduce total test time with minimal changes to your C++ test runners.',
    0
  ),
  (
    'A lead software engineer says the new application uses WebSockets and non-distributed HTTP sessions. You want to ensure it runs properly on Google Cloud Platform. What should you do?',
    'Help convert WebSocket code to HTTP streaming',
    'Review encryption requirements for WebSocket connections with the security team',
    'Discuss Google Cloud load balancer options with the cloud operations team',
    'Redesign to use a distributed session store without WebSockets and HTTP sessions',
    'C',
    'Use Google Cloud HTTP(S) Load Balancing, which natively supports WebSockets, rather than redesigning the app.',
    0
  ),
  (
    'The reliability team added a feature to send all server events to Cloud Storage. Records are 50 KB to 15 MB and can peak at 3,000 events/sec. You want to minimize data loss. Which process should you implement?',
    'Append metadata to file body; compress; name files with serverName + timestamp; rotate bucket hourly',
    'Batch 10,000 events with a manifest; compress all into a single archive; rotate bucket daily',
    'Compress individual files; name with serverName + event sequence; save to one bucket; set custom metadata after saving',
    'Append metadata to file body; compress individual files; name files with a random prefix; save to one bucket',
    'D',
    'Randomized object name prefixes enable Cloud Storage to autoscale request throughput and minimize write hot-spotting and data loss risk.',
    0
  ),
  (
    'An audit revealed a new network in your project and a GCE instance with SSH open to the world. You want to discover the network''s origin. What should you do?',
    'Search for Create VM entries in the alerting console',
    'Use the Activity page and filter Data Access for Create VM',
    'Use Logs Explorer, filter GCE network/firewall logs, and look for create/insert entries',
    'SSH to the instance and correlate system logins with the owners list',
    'C',
    'Use Cloud Logging (Logs Explorer) to find firewall/network create operations such as firewalls.insert to identify who created the rule.',
    0
  ),
  (
    'You need to copy a production Linux VM in us-central to a different project in us-east and be able to replace the copy easily as prod changes. What steps should you take?',
    'Use Linux dd and netcat to stream the root disk to a VM in us-east',
    'Create a snapshot of the root disk and select that snapshot as the root disk in us-east',
    'Create an image file from the root disk with dd; create a new VM in us-east',
    'Create a snapshot, create an image in Cloud Storage from the snapshot, then create a VM in us-east from that image',
    'D',
    'Share the snapshot across projects by creating an image from it (stored in Cloud Storage) and then creating the VM from that image in the target project/region.',
    0
  ),
  (
    'Your company runs several databases on a single MySQL instance. They need regular backups of a specific database. Backups must complete quickly and not impact disk performance. How should you configure storage?',
    'Use gcloud to take persistent disk snapshots on a schedule',
    'Back up to a mounted Local SSD, then move the backup to Cloud Storage',
    'Mount a Cloud Storage bucket with gcsfuse and write mysqldump output there',
    'Use additional persistent disks in RAID10 and LVM snapshots to send to Cloud Storage',
    'B',
    'Write backups to Local SSD to minimize impact and then transfer to Cloud Storage asynchronously.',
    0
  ),
  (
    'You are rolling out a new load-testing tool for services on Compute Engine with Cloud Bigtable. Which three requirements should be included? (Choose three.)',
    'Ensure load tests validate Cloud Bigtable performance using typical workloads',
    'Create a separate Google Cloud project for the load-testing environment',
    'Schedule the tool to run regularly against production',
    'Ensure all third-party systems used can handle high load',
    'Instrument the load-testing tool and target services with detailed logging/metrics',
    'A',
    'Correct set typically includes A, B, and instrumentation/metrics. Note: Current app supports single-answer; using A here.',
    0
  ),
  (
    'Your customer is moving corporate apps to GCP. Security wants detailed visibility of all projects. You are org admin via Resource Manager. Which IAM roles should you give the security team?',
    'Org viewer, project owner',
    'Org viewer, project viewer',
    'Org admin, project browser',
    'Project owner, network admin',
    'B',
    'Org viewer and project viewer provide read-only visibility across organization and projects without overbroad privileges.',
    0
  ),
  (
    'The company prioritizes release speed and agility. You want to reduce the chance of security errors being introduced. Which two actions can you take? (Choose two.)',
    'Require every check-in to be peer reviewed by a security SME',
    'Use source code security analyzers in the CI/CD pipeline',
    'Ensure unit tests cover all interfaces with stubs',
    'Enable code signing and a trusted binary repository integrated with CI/CD',
    'B',
    'Automated static analysis (and vulnerability scanning) in CI/CD reduces the risk of introducing security flaws. Note: Single-answer format used.',
    0
  ),
  (
    'You want to enable your running Google Kubernetes Engine cluster to scale as demand changes. What should you do?',
    'Resize the cluster: gcloud container clusters resize CLUSTER_NAME --size 10',
    'Add instance tags: gcloud compute instances add-tags INSTANCE --tags enable-autoscaling max-nodes-10',
    'Update the existing cluster to enable autoscaling with min/max nodes',
    'Create a new cluster with autoscaling enabled and redeploy',
    'C',
    'Use gcloud container clusters update --enable-autoscaling with appropriate min/max nodes for the node pool.',
    0
  )
) AS q(
  question_text, choice_a, choice_b, choice_c, choice_d, correct_answer, explanation, dummy_cat
);

COMMIT;
