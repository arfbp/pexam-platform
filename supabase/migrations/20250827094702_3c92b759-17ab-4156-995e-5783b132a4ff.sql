
-- First, let's clear all existing questions
DELETE FROM questions;

-- Insert the 10 real exam questions
INSERT INTO questions (question_text, choice_a, choice_b, choice_c, choice_d, correct_answer, explanation, category_id) VALUES 
(
  'Your company''s test suite is a custom C++ application that runs tests throughout each day on Linux virtual machines. The full test suite takes several hours to complete, running on a limited number of on-premises servers reserved for testing. Your company wants to move the testing infrastructure to the cloud, to reduce the amount of time it takes to fully test a change to the system, while changing the tests as little as possible. Which cloud infrastructure should you recommend?',
  'Google Compute Engine unmanaged instance groups and Network Load Balancer',
  'Google Compute Engine managed instance groups with auto-scaling',
  'Google Cloud Dataproc to run Apache Hadoop jobs to process each test',
  'Google App Engine with Google StackDriver for logging',
  'B',
  'Google Compute Engine enables users to launch virtual machines (VMs) on demand. Managed instance groups offer autoscaling capabilities that allow you to automatically add or remove instances from a managed instance group based on increases or decreases in load. Autoscaling helps your applications gracefully handle increases in traffic and reduces cost when the need for resources is lower.',
  1
),
(
  'A lead software engineer tells you that his new application design uses websockets and HTTP sessions that are not distributed across the web servers. You want to help him ensure his application will run properly on Google Cloud Platform. What should you do?',
  'Help the engineer to convert his websocket code to use HTTP streaming',
  'Review the encryption requirements for websocket connections with the security team',
  'Meet with the cloud operations team and the engineer to discuss load balancer options',
  'Help the engineer redesign the application to use a distributed user session service that does not rely on websockets and HTTP sessions',
  'C',
  'Google Cloud Platform (GCP) HTTP(S) load balancing provides global load balancing for HTTP(S) requests destined for your instances. The HTTP(S) load balancer has native support for the WebSocket protocol.',
  1
),
(
  'The application reliability team at your company has added a debug feature to their backend service to send all server events to Google Cloud Storage for eventual analysis. The event records are at least 50 KB and at most 15 MB and are expected to peak at 3,000 events per second. You want to minimize data loss. Which process should you implement?',
  'Append metadata to file body • Compress individual files • Name files with serverName • Timestamp • Create a new bucket if bucket is older than 1 hour and save individual files to the new bucket. Otherwise, save files to existing bucket.',
  'Batch every 10,000 events with a single manifest file for metadata • Compress event files and manifest file into a single archive file • Name files using serverName • EventSequence • Create a new bucket if bucket is older than 1 day and save the single archive file to the new bucket. Otherwise, save the single archive file to existing bucket.',
  'Compress individual files • Name files with serverName • EventSequence • Save files to one bucket • Set custom metadata headers for each object after saving',
  'Append metadata to file body • Compress individual files • Name files with a random prefix pattern • Save files to one bucket',
  'D',
  'A longer randomized prefix provides more effective auto-scaling when ramping to very high read and write rates. For example, a 1-character prefix using a random hex value provides effective auto-scaling from the initial 5000/1000 reads/writes per second up to roughly 80000/16000 reads/writes per second.',
  1
),
(
  'A recent audit revealed that a new network was created in your GCP project. In this network, a GCE instance has an SSH port open to the world. You want to discover this network''s origin. What should you do?',
  'Search for Create VM entry in the Stackdriver alerting console',
  'Navigate to the Activity page in the Home section. Set category to Data Access and search for Create VM entry',
  'In the Logging section of the console, specify GCE Network as the logging section. Search for the Create Insert entry',
  'Connect to the GCE instance using project SSH keys. Identify previous logins in system logs, and match these with the project owners list',
  'C',
  'In Logs Explorer, Filter "resource.type="gce_firewall_rule" and Query insert Create. You would see methodName": "v1.compute.firewalls.insert", "authorizationInfo": [ { "permission": "compute.firewalls.create"',
  1
),
(
  'You want to make a copy of a production Linux virtual machine in the US-Central region. You want to manage and replace the copy easily if there are changes on the production virtual machine. You will deploy the copy as a new instance in a different project in the US-East region. What steps must you take?',
  'Use the Linux dd and netcat commands to copy and stream the root disk contents to a new virtual machine instance in the US-East region',
  'Create a snapshot of the root disk and select the snapshot as the root disk when you create a new virtual machine instance in the US-East region',
  'Create an image file from the root disk with Linux dd command, create a new virtual machine instance in the US-East region',
  'Create a snapshot of the root disk, create an image file in Google Cloud Storage from the snapshot, and create a new virtual machine instance in the US-East region using the image file the root disk',
  'D',
  'Disk creation from the shared snapshot is required while using snapshot across project. Since snapshot sharing across projects requires creating an image file in Google Cloud Storage from the snapshot.',
  1
),
(
  'Your company runs several databases on a single MySQL instance. They need to take backups of a specific database at regular intervals. The backup activity needs to complete as quickly as possible and cannot be allowed to impact disk performance. How should you configure the storage?',
  'Configure a cron job to use the gcloud tool to take regular backups using persistent disk snapshots',
  'Mount a Local SSD volume as the backup location. After the backup is complete, use gsutil to move the backup to Google Cloud Storage',
  'Use gcsfuse to mount a Google Cloud Storage bucket as a volume directly on the instance and write backups to the mounted location using mysqldump',
  'Mount additional persistent disk volumes onto each virtual machine (VM) instance in a RAID10 array and use LVM to create snapshots to send to Cloud Storage',
  'B',
  'Local SSD provides the fastest performance for backup operations without impacting the main disk performance. After backup completion, gsutil can move the backup to Cloud Storage without affecting the production database.',
  1
),
(
  'You are helping the QA team to roll out a new load-testing tool to test the scalability of your primary cloud services that run on Google Compute Engine with Cloud Bigtable. Which three requirements should they include? (Choose three.)',
  'Ensure that the load tests validate the performance of Cloud Bigtable',
  'Create a separate Google Cloud project to use for the load-testing environment',
  'Schedule the load-testing tool to regularly run against the production environment',
  'Ensure all third-party systems your services use is capable of handling high load',
  'Instrument the production services to record every transaction for replay by the load-testing tool',
  'A',
  'Correct answers are A, B, and F. A: Run your typical workloads against Bigtable for capacity planning. B: Create separate project for load-testing environment. F: Instrument with detailed logging and metrics collection.',
  1
),
(
  'Your customer is moving their corporate applications to Google Cloud Platform. The security team wants detailed visibility of all projects in the organization. You provision the Google Cloud Resource Manager and set up yourself as the org admin. What Google Cloud Identity and Access Management (Cloud IAM) roles should you give to the security team?',
  'Org viewer, project owner',
  'Org viewer, project viewer',
  'Org admin, project browser',
  'Project owner, network admin',
  'B',
  'Org viewer grants the security team permissions to view the organization''s display name. Project viewer grants the security team permissions to see the resources within projects without overly broad permissions.',
  1
),
(
  'Your company places a high value on being responsive and meeting customer needs quickly. Their primary business objectives are release speed and agility. You want to reduce the chance of security errors being accidentally introduced. Which two actions can you take? (Choose two.)',
  'Ensure every code check-in is peer reviewed by a security SME',
  'Use source code security analyzers as part of the CI/CD pipeline',
  'Ensure you have stubs to unit test all interfaces between components',
  'Enable code signing and a trusted binary repository integrated with your CI/CD pipeline',
  'B',
  'Correct answers are B and E. B: Static analysis inspects source code to identify defects and vulnerabilities as part of CI/CD pipeline. E: Run vulnerability security scanner as part of CI/CD pipeline.',
  1
),
(
  'You want to enable your running Google Kubernetes Engine cluster to scale as demand for your application changes. What should you do?',
  'Add additional nodes to your Kubernetes Engine cluster using the following command: gcloud container clusters resize CLUSTER_Name --size 10',
  'Add a tag to the instances in the cluster with the following command: gcloud compute instances add-tags INSTANCE --tags enable-autoscaling max-nodes-10',
  'Update the existing Kubernetes Engine cluster with the following command: gcloud alpha container clusters update mycluster --enable-autoscaling --min-nodes=1 --max-nodes=10',
  'Create a new Kubernetes Engine cluster with the following command: gcloud alpha container clusters create mycluster --enable-autoscaling --min-nodes=1 --max-nodes=10 and redeploy your application',
  'C',
  'To enable autoscaling for an existing node pool: gcloud container clusters update cluster-name --enable-autoscaling --min-nodes 1 --max-nodes 10 --zone compute-zone --node-pool default-pool',
  1
);
