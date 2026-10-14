
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
DROP TABLE IF EXISTS `achievements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `achievements` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `published` tinyint(1) NOT NULL DEFAULT '1',
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `title` text COLLATE utf8mb4_unicode_ci,
  `title_np` text COLLATE utf8mb4_unicode_ci,
  `category` text COLLATE utf8mb4_unicode_ci,
  `year` text COLLATE utf8mb4_unicode_ci,
  `metric` text COLLATE utf8mb4_unicode_ci,
  `metric_label` text COLLATE utf8mb4_unicode_ci,
  `metric_label_np` text COLLATE utf8mb4_unicode_ci,
  `ward` text COLLATE utf8mb4_unicode_ci,
  `ward_np` text COLLATE utf8mb4_unicode_ci,
  `status` text COLLATE utf8mb4_unicode_ci,
  `summary` mediumtext COLLATE utf8mb4_unicode_ci,
  `summary_np` mediumtext COLLATE utf8mb4_unicode_ci,
  `body` mediumtext COLLATE utf8mb4_unicode_ci,
  `body_np` mediumtext COLLATE utf8mb4_unicode_ci,
  `image` text COLLATE utf8mb4_unicode_ci,
  `gallery` mediumtext COLLATE utf8mb4_unicode_ci,
  `document` text COLLATE utf8mb4_unicode_ci,
  `featured` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `achievements_slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `achievements` WRITE;
/*!40000 ALTER TABLE `achievements` DISABLE KEYS */;
INSERT INTO `achievements` VALUES (7,'achievement',1,0,'2026-10-05 11:35:19','2026-10-05 11:35:19',NULL,'lfkajdflaf','Youth & sports','2081','fadsfjaldfja',NULL,'fakldfafa',NULL,'damak','Completed',NULL,'faljksdfjalfa',NULL,'lfakjdflakd lkdjfalk kljfdajaf','/uploads/2026/10/image1-5mnIaoyD.jpg',NULL,NULL,1);
/*!40000 ALTER TABLE `achievements` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `activity`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activity` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `user_name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `action` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `collection` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `item_id` int DEFAULT NULL,
  `item_title` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=150 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `activity` WRITE;
/*!40000 ALTER TABLE `activity` DISABLE KEYS */;
INSERT INTO `activity` VALUES (1,1,'Site Administrator','signed in',NULL,NULL,NULL,'2026-10-04 09:02:41'),(2,1,'Site Administrator','signed in',NULL,NULL,NULL,'2026-10-04 09:23:09'),(3,NULL,'Visitor','filed a grievance','grievances',1,'Broken culvert near school','2026-10-04 09:23:47'),(4,1,'Site Administrator','signed in',NULL,NULL,NULL,'2026-10-04 09:23:48'),(5,1,'Site Administrator','uploaded 2 files','media',NULL,NULL,'2026-10-04 09:23:48'),(6,1,'Site Administrator','created','albums',1,'Ward 4 dialogue','2026-10-04 09:23:48'),(7,1,'Site Administrator','created','posts',4,'नेपाली मात्र शीर्षक','2026-10-04 09:23:48'),(8,1,'Site Administrator','updated','grievances',1,'Broken culvert near school','2026-10-04 09:23:56'),(9,1,'Site Administrator','deleted','albums',1,'Ward 4 dialogue','2026-10-04 09:24:13'),(10,1,'Site Administrator','deleted','posts',4,'नेपाली मात्र शीर्षक','2026-10-04 09:24:13'),(11,1,'Site Administrator','deleted','grievances',1,'Broken culvert near school','2026-10-04 09:24:13'),(12,1,'Site Administrator','deleted file','media',NULL,'test.png','2026-10-04 09:24:13'),(13,1,'Site Administrator','deleted file','media',NULL,'test.pdf','2026-10-04 09:24:13'),(14,1,'Site Administrator','signed in',NULL,NULL,NULL,'2026-10-04 09:24:23'),(15,1,'Site Administrator','signed in',NULL,NULL,NULL,'2026-10-04 09:25:10'),(16,1,'Site Administrator','updated','achievements',2,'Science labs for five community schools','2026-10-04 09:33:36'),(17,1,'Site Administrator','updated','achievements',2,'Science labs for five community schools','2026-10-04 09:33:37'),(18,1,'Site Administrator','signed in',NULL,NULL,NULL,'2026-10-04 11:11:32'),(19,1,'Site Administrator','uploaded 1 file','media',NULL,NULL,'2026-10-04 11:27:16'),(20,1,'Site Administrator','created','albums',2,'helo','2026-10-04 11:27:28'),(21,1,'Site Administrator','uploaded 1 file','media',NULL,NULL,'2026-10-04 11:33:13'),(22,1,'Site Administrator','updated','albums',2,'helo','2026-10-04 11:33:24'),(23,1,'Site Administrator','uploaded 1 file','media',NULL,NULL,'2026-10-04 11:41:35'),(24,1,'Site Administrator','updated','albums',2,'helo','2026-10-04 11:41:38'),(25,1,'Site Administrator','updated','albums',2,'helo','2026-10-04 11:41:47'),(26,1,'Site Administrator','signed in',NULL,NULL,NULL,'2026-10-05 08:55:47'),(27,1,'Site Administrator','signed in',NULL,NULL,NULL,'2026-10-05 08:56:44'),(28,NULL,'Visitor','filed a grievance','grievances',2,'घुस सम्बन्धि','2026-10-05 08:58:30'),(29,1,'Site Administrator','updated','grievances',2,'घुस सम्बन्धि','2026-10-05 08:59:31'),(30,NULL,'Visitor','signed up','volunteers',1,'raghav dahal','2026-10-05 09:00:26'),(31,1,'Site Administrator','updated','volunteers',1,'raghav dahal','2026-10-05 09:00:54'),(32,1,'Site Administrator','updated','grievances',2,'घुस सम्बन्धि','2026-10-05 09:01:02'),(33,1,'Site Administrator','uploaded 1 file','media',NULL,NULL,'2026-10-05 09:08:15'),(34,1,'Site Administrator','uploaded 1 file','media',NULL,NULL,'2026-10-05 09:08:40'),(35,1,'Site Administrator','created','posts',5,'उर्लाबारीकाे समस्या के हाे ?','2026-10-05 09:08:48'),(36,1,'Site Administrator','updated','posts',5,'उर्लाबारीकाे समस्या के हाे ?','2026-10-05 09:08:52'),(37,1,'Site Administrator','deleted','grievances',2,'घुस सम्बन्धि','2026-10-05 09:17:48'),(38,1,'Site Administrator','deleted','volunteers',1,'raghav dahal','2026-10-05 09:17:54'),(39,1,'Site Administrator','deleted','achievements',2,'Science labs for five community schools','2026-10-05 09:18:02'),(40,1,'Site Administrator','deleted','achievements',3,'Flood embankment on the Bakraha','2026-10-05 09:18:04'),(41,1,'Site Administrator','deleted','achievements',6,'Women\'s enterprise revolving fund','2026-10-05 09:18:05'),(42,1,'Site Administrator','deleted','achievements',1,'Blacktopped the Urlabari–Rajghat link road','2026-10-05 09:18:07'),(43,1,'Site Administrator','deleted','achievements',4,'Vegetable collection centre','2026-10-05 09:18:10'),(44,1,'Site Administrator','reordered','ideas',NULL,NULL,'2026-10-05 09:18:22'),(45,1,'Site Administrator','reordered','ideas',NULL,NULL,'2026-10-05 09:18:22'),(46,1,'Site Administrator','reordered','ideas',NULL,NULL,'2026-10-05 09:18:23'),(47,1,'Site Administrator','reordered','ideas',NULL,NULL,'2026-10-05 09:18:24'),(48,1,'Site Administrator','deleted','posts',1,'Ward dialogue series begins in Rajghat','2026-10-05 09:18:36'),(49,1,'Site Administrator','deleted','posts',2,'Asset declaration published','2026-10-05 09:18:40'),(50,1,'Site Administrator','deleted','posts',3,'Why Urlabari needs a cold store','2026-10-05 09:18:42'),(51,1,'Site Administrator','deleted','albums',2,'helo','2026-10-05 09:18:48'),(52,1,'Site Administrator','deleted','documents',4,'Periodic plan review','2026-10-05 09:18:57'),(53,1,'Site Administrator','deleted','events',3,'Youth & returnee jobs forum','2026-10-05 09:19:08'),(54,1,'Site Administrator','deleted','events',2,'Farmers\' meeting on the cold store','2026-10-05 09:19:20'),(55,1,'Site Administrator','deleted','events',1,'Ward 4 public dialogue','2026-10-05 09:19:21'),(56,1,'Site Administrator','deleted','testimonials',1,'Sample Name','2026-10-05 09:19:35'),(57,1,'Site Administrator','deleted','testimonials',2,'Sample Name','2026-10-05 09:19:37'),(58,1,'Site Administrator','uploaded 1 file','media',NULL,NULL,'2026-10-05 09:20:27'),(59,1,'Site Administrator','updated','settings',NULL,'Site settings','2026-10-05 09:20:31'),(60,1,'Site Administrator','uploaded 1 file','media',NULL,NULL,'2026-10-05 09:23:01'),(61,1,'Site Administrator','updated','settings',NULL,'Site settings','2026-10-05 09:23:05'),(62,1,'Site Administrator','uploaded 1 file','media',NULL,NULL,'2026-10-05 09:24:00'),(63,1,'Site Administrator','updated','settings',NULL,'Site settings','2026-10-05 09:24:03'),(64,1,'Site Administrator','deleted','achievements',5,'Senior citizens\' day-care centre','2026-10-05 09:32:44'),(65,1,'Site Administrator','deleted','posts',5,'उर्लाबारीकाे समस्या के हाे ?','2026-10-05 09:32:51'),(66,1,'Site Administrator','created','videos',1,'Raghav','2026-10-05 09:33:24'),(67,1,'Site Administrator','uploaded 1 file','media',NULL,NULL,'2026-10-05 09:35:02'),(68,1,'Site Administrator','created','testimonials',3,'रामेश्वर यादब','2026-10-05 09:35:06'),(69,NULL,'Visitor','filed a grievance','grievances',3,'something','2026-10-05 09:37:46'),(70,1,'Site Administrator','updated','grievances',3,'something','2026-10-05 09:38:16'),(71,1,'Site Administrator','updated','grievances',3,'something','2026-10-05 09:38:25'),(72,1,'Site Administrator','updated','grievances',3,'something','2026-10-05 09:38:51'),(73,1,'Site Administrator','deleted','videos',1,'Raghav','2026-10-05 09:39:26'),(74,1,'Site Administrator','uploaded 1 file','media',NULL,NULL,'2026-10-05 09:39:45'),(75,1,'Site Administrator','created','albums',3,'ABOUT ME','2026-10-05 09:39:52'),(76,NULL,'Visitor','filed a grievance','grievances',4,'घुस सम्बन्धि','2026-10-05 11:32:36'),(77,1,'Site Administrator','updated','grievances',4,'घुस सम्बन्धि','2026-10-05 11:33:18'),(78,NULL,'Visitor','submitted','messages',1,'मलाक्षामा','2026-10-05 11:34:16'),(79,1,'Site Administrator','updated','messages',1,'मलाक्षामा','2026-10-05 11:34:22'),(80,1,'Site Administrator','updated','messages',1,'मलाक्षामा','2026-10-05 11:34:22'),(81,1,'Site Administrator','uploaded 1 file','media',NULL,NULL,'2026-10-05 11:35:11'),(82,1,'Site Administrator','created','achievements',7,'lfkajdflaf','2026-10-05 11:35:19'),(83,1,'Site Administrator','created','videos',2,'मेराे भनाइ','2026-10-05 11:38:02'),(84,1,'Site Administrator','updated','videos',2,'मेराे भनाइ','2026-10-05 11:39:16'),(85,1,'Site Administrator','updated','videos',2,'मेराे भनाइ','2026-10-05 11:39:32'),(86,1,'Site Administrator','created','videos',3,'how it is','2026-10-05 11:40:40'),(87,1,'Site Administrator','updated','videos',3,'how it is','2026-10-05 11:40:58'),(88,1,'Site Administrator','created','events',4,'मेराे भनाइ','2026-10-05 11:41:19'),(89,NULL,'Visitor','signed up','volunteers',2,'raghav','2026-10-05 11:42:08'),(90,1,'Site Administrator','added team member','users',2,'raghav','2026-10-05 11:43:22'),(91,2,'raghav','signed in',NULL,NULL,NULL,'2026-10-05 11:43:30'),(92,1,'Site Administrator','signed in',NULL,NULL,NULL,'2026-10-05 11:44:00'),(93,1,'Site Administrator','uploaded 1 file','media',NULL,NULL,'2026-10-05 11:45:26'),(94,1,'Site Administrator','created','albums',4,'VOLUNTEER ALBUM','2026-10-05 11:45:35'),(95,1,'Site Administrator','updated','albums',4,'VOLUNTEER ALBUM','2026-10-05 11:45:39'),(96,1,'Site Administrator','updated','albums',4,'VOLUNTEER ALBUM','2026-10-05 11:46:03'),(97,1,'Site Administrator','updated','albums',4,'VOLUNTEER ALBUM','2026-10-05 11:46:10'),(98,1,'Site Administrator','updated','albums',4,'VOLUNTEER ALBUM','2026-10-05 11:46:22'),(99,1,'Site Administrator','updated','albums',4,'VOLUNTEER ALBUM','2026-10-05 11:46:25'),(100,1,'Site Administrator','uploaded 1 file','media',NULL,NULL,'2026-10-05 11:49:26'),(101,1,'Site Administrator','created','posts',6,'उर्लाबारीकाे समस्या के हाे ?','2026-10-05 11:49:40'),(102,1,'Site Administrator','updated','posts',6,'उर्लाबारीकाे समस्या के हाे ?','2026-10-05 11:49:42'),(103,1,'Site Administrator','uploaded 1 file','media',NULL,NULL,'2026-10-05 11:51:13'),(104,1,'Site Administrator','updated','settings',NULL,'Site settings','2026-10-05 11:51:16'),(105,1,'Site Administrator','uploaded 1 file','media',NULL,NULL,'2026-10-05 11:52:49'),(106,1,'Site Administrator','created','documents',6,'fajdla ','2026-10-05 11:52:53'),(107,1,'Site Administrator','updated','settings',NULL,'Site settings','2026-10-05 11:54:32'),(108,1,'Site Administrator','updated','settings',NULL,'Site settings','2026-10-05 11:55:02'),(109,1,'Site Administrator','updated','settings',NULL,'Site settings','2026-10-05 11:55:51'),(110,1,'Site Administrator','updated','settings',NULL,'Site settings','2026-10-05 11:57:08'),(111,1,'Site Administrator','updated','settings',NULL,'Site settings','2026-10-05 11:57:26'),(112,1,'Site Administrator','created','videos',4,'मेराे भनाइ @af','2026-10-05 12:00:14'),(113,1,'Site Administrator','updated','videos',4,'मेराे भनाइ @af','2026-10-05 12:00:16'),(114,1,'Site Administrator','updated','videos',3,'how it is','2026-10-05 12:01:59'),(115,1,'Site Administrator','updated','videos',3,'how it is','2026-10-05 12:02:03'),(116,1,'Site Administrator','uploaded 1 file','media',NULL,NULL,'2026-10-05 12:02:59'),(117,1,'Site Administrator','created','testimonials',4,'raghav','2026-10-05 12:03:03'),(118,1,'Site Administrator','deleted','testimonials',4,'raghav','2026-10-05 12:03:19'),(119,1,'Site Administrator','updated','wards',8,'Rajghat VDC wards 1–4, 9','2026-10-05 12:03:50'),(120,1,'Site Administrator','updated','settings',NULL,'Site settings','2026-10-05 12:06:54'),(121,1,'Site Administrator','updated','settings',NULL,'Site settings','2026-10-05 12:07:57'),(122,1,'Site Administrator','updated','settings',NULL,'Site settings','2026-10-05 12:14:16'),(123,1,'Site Administrator','updated','settings',NULL,'Site settings','2026-10-05 12:17:51'),(124,1,'Site Administrator','updated','settings',NULL,'Site settings','2026-10-05 12:18:08'),(125,1,'Site Administrator','signed in',NULL,NULL,NULL,'2026-10-13 10:36:24'),(126,1,'Site Administrator','signed in',NULL,NULL,NULL,'2026-10-13 10:36:53'),(127,1,'Site Administrator','updated','settings',NULL,'Site settings','2026-10-13 10:37:47'),(128,1,'Site Administrator','created survey','surveys',1,'Untitled survey','2026-10-14 01:51:49'),(129,1,'Site Administrator','opened survey','surveys',1,'This is the college project','2026-10-14 01:52:46');
/*!40000 ALTER TABLE `activity` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `albums`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `albums` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `published` tinyint(1) NOT NULL DEFAULT '1',
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `title` text COLLATE utf8mb4_unicode_ci,
  `title_np` text COLLATE utf8mb4_unicode_ci,
  `date` text COLLATE utf8mb4_unicode_ci,
  `location` text COLLATE utf8mb4_unicode_ci,
  `location_np` text COLLATE utf8mb4_unicode_ci,
  `description` mediumtext COLLATE utf8mb4_unicode_ci,
  `description_np` mediumtext COLLATE utf8mb4_unicode_ci,
  `cover` text COLLATE utf8mb4_unicode_ci,
  `photos` mediumtext COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `albums_slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `albums` WRITE;
/*!40000 ALTER TABLE `albums` DISABLE KEYS */;
INSERT INTO `albums` VALUES (3,'album',1,0,'2026-10-05 09:39:52','2026-10-05 09:39:52',NULL,'ABOUT ME','2026-10-14',NULL,'urlabari',NULL,'something','/uploads/2026/10/image1-oBxq6tWo.jpg','[{\"url\":\"/uploads/2026/10/image1-RBT7aCcE.jpg\",\"width\":480,\"height\":480,\"caption\":\"\"},{\"url\":\"/uploads/2026/10/image1-CvWcPKVA.jpg\",\"width\":480,\"height\":480,\"caption\":\"\"},{\"url\":\"/uploads/2026/10/image1-0X5ccmcu.jpg\",\"width\":480,\"height\":480,\"caption\":\"\"},{\"url\":\"/uploads/2026/10/5a991a8f-d0d6-4802-a79c-418095906f5d-1mFCKFOK.png\",\"width\":770,\"height\":774,\"caption\":\"\"}]'),(4,'album-2',1,0,'2026-10-05 11:45:35','2026-10-05 11:46:25',NULL,'VOLUNTEER ALBUM','2026-10-15',NULL,'urlabari',NULL,'VOLUNTEER PEOPLE','/uploads/2026/10/image1-s7Hhu6_K.jpg','[{\"url\":\"/uploads/2026/10/image1-5mnIaoyD.jpg\",\"width\":480,\"height\":480,\"caption\":\"\"},{\"url\":\"/uploads/2026/10/image1-oBxq6tWo.jpg\",\"width\":480,\"height\":480,\"caption\":\"\"}]');
/*!40000 ALTER TABLE `albums` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `documents` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `published` tinyint(1) NOT NULL DEFAULT '1',
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `title` text COLLATE utf8mb4_unicode_ci,
  `title_np` text COLLATE utf8mb4_unicode_ci,
  `category` text COLLATE utf8mb4_unicode_ci,
  `fiscal_year` text COLLATE utf8mb4_unicode_ci,
  `published_at` text COLLATE utf8mb4_unicode_ci,
  `reference` text COLLATE utf8mb4_unicode_ci,
  `description` mediumtext COLLATE utf8mb4_unicode_ci,
  `description_np` mediumtext COLLATE utf8mb4_unicode_ci,
  `file` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `documents_slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `documents` WRITE;
/*!40000 ALTER TABLE `documents` DISABLE KEYS */;
INSERT INTO `documents` VALUES (1,NULL,1,0,'2026-10-04 09:02:38','2026-10-04 09:02:38','Urlabari Municipality — Policy & Programme, FY 2083/84','उर्लाबारी नगरपालिका — आर्थिक वर्ष २०८३/८४ को नीति तथा कार्यक्रम','Policy & plan','2083/84','2026-07-03',NULL,'The municipal executive\'s annual policy and programme, as presented to the municipal assembly.','नगर सभामा प्रस्तुत नगर कार्यपालिकाको वार्षिक नीति तथा कार्यक्रम।','/uploads/documents/policy8384.pdf'),(2,NULL,1,1,'2026-10-04 09:02:38','2026-10-04 09:02:38','First Periodic Plan 2079/80–2083/84 — Main report & maps','प्रथम आवधिक योजना २०७९/८०–२०८३/८४ — मूल प्रतिवेदन तथा नक्सा','Policy & plan','2079/80','2022-07-15',NULL,'Five-year development plan for Urlabari Municipality, volume 1.','उर्लाबारी नगरपालिकाको पञ्चवर्षीय विकास योजना, खण्ड १।','/uploads/documents/plan_vol1.pdf'),(3,NULL,1,2,'2026-10-04 09:02:38','2026-10-04 09:02:38','First Periodic Plan — Annexes','प्रथम आवधिक योजना — अनुसूचीहरू','Policy & plan','2079/80','2022-07-15',NULL,'Volume 2 of the periodic plan: data tables and annexes.','आवधिक योजनाको खण्ड २: तथ्यांक तालिका तथा अनुसूची।','/uploads/documents/plan_vol2.pdf'),(5,NULL,1,4,'2026-10-04 09:02:38','2026-10-04 09:02:38','Urlabari ward-by-ward facts report','उर्लाबारी वडागत तथ्य प्रतिवेदन','Other','2083/84','2026-10-03',NULL,'Population, economy, schools and election results for each ward, compiled from Census 2078 and Election Commission data.','जनगणना २०७८ र निर्वाचन आयोगको तथ्यांकबाट संकलित वडागत जनसंख्या, अर्थतन्त्र, विद्यालय र निर्वाचन परिणाम।','/uploads/documents/Urlabari-Campaign-Report.pdf'),(6,NULL,1,0,'2026-10-05 11:52:53','2026-10-05 11:52:53',NULL,'fajdla ','Other','2081/82','2026-10-14',NULL,NULL,'faslkjflak ','/uploads/2026/10/urlabari-campaign-report-2wXj0K6w.pdf');
/*!40000 ALTER TABLE `documents` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `events` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `published` tinyint(1) NOT NULL DEFAULT '1',
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `title` text COLLATE utf8mb4_unicode_ci,
  `title_np` text COLLATE utf8mb4_unicode_ci,
  `starts_at` text COLLATE utf8mb4_unicode_ci,
  `ends_at` text COLLATE utf8mb4_unicode_ci,
  `location` text COLLATE utf8mb4_unicode_ci,
  `location_np` text COLLATE utf8mb4_unicode_ci,
  `description` mediumtext COLLATE utf8mb4_unicode_ci,
  `description_np` mediumtext COLLATE utf8mb4_unicode_ci,
  `image` text COLLATE utf8mb4_unicode_ci,
  `map_url` text COLLATE utf8mb4_unicode_ci,
  `register_url` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `events_slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `events` WRITE;
/*!40000 ALTER TABLE `events` DISABLE KEYS */;
INSERT INTO `events` VALUES (4,'event',1,0,'2026-10-05 11:41:19','2026-10-05 11:41:19',NULL,'मेराे भनाइ','2026-10-04T17:26','2026-10-07T17:26',NULL,'urlabari',NULL,'fadf akdlf f asdfjakl ',NULL,NULL,NULL);
/*!40000 ALTER TABLE `events` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `grievances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `grievances` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `published` tinyint(1) NOT NULL DEFAULT '1',
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `code` text COLLATE utf8mb4_unicode_ci,
  `status` text COLLATE utf8mb4_unicode_ci,
  `subject` text COLLATE utf8mb4_unicode_ci,
  `category` text COLLATE utf8mb4_unicode_ci,
  `ward` text COLLATE utf8mb4_unicode_ci,
  `name` text COLLATE utf8mb4_unicode_ci,
  `phone` text COLLATE utf8mb4_unicode_ci,
  `email` text COLLATE utf8mb4_unicode_ci,
  `message` mediumtext COLLATE utf8mb4_unicode_ci,
  `attachment` text COLLATE utf8mb4_unicode_ci,
  `response` mediumtext COLLATE utf8mb4_unicode_ci,
  `internal_note` mediumtext COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `grievances_slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `grievances` WRITE;
/*!40000 ALTER TABLE `grievances` DISABLE KEYS */;
INSERT INTO `grievances` VALUES (3,NULL,1,0,'2026-10-05 09:37:46','2026-10-05 09:38:51','UR-9TS845','In progress','something','Water & sanitation','3','raghav','9876543212',NULL,'fasomthi this is issues',NULL,'तपाइकाे सुाबमाबिप',NULL),(4,NULL,1,0,'2026-10-05 11:32:36','2026-10-05 11:33:18','UR-AFAVE2','In review','घुस सम्बन्धि','Corruption','8','raghav','9807381017',NULL,'fadnfa,nfd,amd',NULL,'kaam hudai xa hai','police lai vaenko xuuu');
/*!40000 ALTER TABLE `grievances` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `ideas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ideas` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `published` tinyint(1) NOT NULL DEFAULT '1',
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `title` text COLLATE utf8mb4_unicode_ci,
  `title_np` text COLLATE utf8mb4_unicode_ci,
  `kicker` text COLLATE utf8mb4_unicode_ci,
  `kicker_np` text COLLATE utf8mb4_unicode_ci,
  `summary` mediumtext COLLATE utf8mb4_unicode_ci,
  `summary_np` mediumtext COLLATE utf8mb4_unicode_ci,
  `points` mediumtext COLLATE utf8mb4_unicode_ci,
  `points_np` mediumtext COLLATE utf8mb4_unicode_ci,
  `body` mediumtext COLLATE utf8mb4_unicode_ci,
  `body_np` mediumtext COLLATE utf8mb4_unicode_ci,
  `image` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `ideas_slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `ideas` WRITE;
/*!40000 ALTER TABLE `ideas` DISABLE KEYS */;
INSERT INTO `ideas` VALUES (1,'every-rupee-in-public',1,0,'2026-10-04 09:02:38','2026-10-04 09:02:38','Every rupee, in public','हरेक रुपैयाँ, सार्वजनिक','Open government','खुला सरकार','Budgets, contracts and spending published ward by ward, in plain language, every quarter.','बजेट, ठेक्का र खर्च वडागत रूपमा, सरल भाषामा, हरेक त्रैमासिक सार्वजनिक।','[\"Online register of all contracts and contractors\",\"Quarterly ward spending reports\",\"Twice-yearly public hearings in every ward\"]','[\"सबै ठेक्का र ठेकेदारको अनलाइन दर्ता\",\"त्रैमासिक वडा खर्च प्रतिवेदन\",\"हरेक वडामा वर्षमा दुई पटक सार्वजनिक सुनुवाइ\"]',NULL,NULL,NULL),(2,'farmers-paid-fairly-on-time',1,1,'2026-10-04 09:02:38','2026-10-04 09:02:38','Farmers paid fairly, on time','किसानलाई उचित मूल्य, समयमै','Farming','कृषि','78% of our land is farmland. A cold store, a collection centre in each cluster and direct buyer links.','हाम्रो ७८% जमिन खेतीयोग्य छ। शीत भण्डार, हरेक क्लस्टरमा संकलन केन्द्र र खरिदकर्तासँग प्रत्यक्ष सम्पर्क।','[\"Municipal cold store and vegetable market\",\"Irrigation from Ratuwa and Mawa rivers\",\"Soil testing and seed support at ward offices\"]','[\"नगरपालिकाको शीत भण्डार र तरकारी बजार\",\"रतुवा र मावा खोलाबाट सिँचाइ\",\"वडा कार्यालयमा माटो परीक्षण र बीउ सहयोग\"]',NULL,NULL,NULL),(3,'work-at-home-not-only-abroad',1,2,'2026-10-04 09:02:38','2026-10-04 09:02:38','Work at home, not only abroad','विदेश मात्र होइन, घरमै काम','Jobs','रोजगारी','More than 7,500 of our people are working abroad. Skills, start-up loans and local enterprise to bring the next generation home.','हाम्रा ७,५०० भन्दा बढी मानिस विदेशमा काम गरिरहेका छन्। अर्को पुस्तालाई घर फर्काउन सीप, सुरुवाती ऋण र स्थानीय उद्यम।','[\"Vocational training centre with returnee programme\",\"Low-interest youth enterprise fund\",\"Local hiring targets for municipal projects\"]','[\"फर्किएकाहरूका लागि कार्यक्रमसहित व्यावसायिक तालिम केन्द्र\",\"न्यून ब्याजको युवा उद्यम कोष\",\"नगरपालिकाका आयोजनामा स्थानीय रोजगारी लक्ष्य\"]',NULL,NULL,NULL),(4,'public-schools-parents-choose',1,3,'2026-10-04 09:02:38','2026-10-04 09:02:38','Public schools parents choose','अभिभावकले रोज्ने सामुदायिक विद्यालय','Schools','शिक्षा','Science labs, trained teachers and a free midday meal in all 23 community schools.','सबै २३ सामुदायिक विद्यालयमा विज्ञान प्रयोगशाला, तालिमप्राप्त शिक्षक र निःशुल्क दिवा खाजा।','[\"Lab and library in every secondary school\",\"Teacher training with the community campuses\",\"Scholarships for girls and Dalit students\"]','[\"हरेक माध्यमिक विद्यालयमा प्रयोगशाला र पुस्तकालय\",\"सामुदायिक क्याम्पससँग शिक्षक तालिम\",\"छात्रा र दलित विद्यार्थीलाई छात्रवृत्ति\"]',NULL,NULL,NULL),(5,'care-within-thirty-minutes',1,4,'2026-10-04 09:02:38','2026-10-04 09:02:38','Care within thirty minutes','तीस मिनेटभित्र उपचार','Health','स्वास्थ्य','A staffed health post within half an hour of every home, with a 24-hour birthing centre.','हरेक घरबाट आधा घण्टाभित्र कर्मचारीसहितको स्वास्थ्य चौकी, २४ घण्टे प्रसूति केन्द्रसहित।','[\"24-hour birthing centre\",\"Free health insurance enrolment drive\",\"Mobile clinics for elderly residents\"]','[\"२४ घण्टे प्रसूति केन्द्र\",\"निःशुल्क स्वास्थ्य बीमा दर्ता अभियान\",\"ज्येष्ठ नागरिकका लागि घुम्ती क्लिनिक\"]',NULL,NULL,NULL),(6,'safe-from-the-monsoon',1,5,'2026-10-04 09:02:38','2026-10-04 09:02:38','Safe from the monsoon','बर्खाबाट सुरक्षित','Rivers & land','नदी र जमिन','River training on the Bakraha and Ratuwa, proper drainage in the bazaar, and protected wetlands.','बक्राहा र रतुवामा तटबन्ध, बजारमा व्यवस्थित ढल, र सिमसार क्षेत्रको संरक्षण।','[\"Embankments on flood-prone stretches\",\"Bazaar drainage master plan\",\"Protect Betini and Lampate wetlands\"]','[\"बाढी जोखिम क्षेत्रमा तटबन्ध\",\"बजार ढल गुरुयोजना\",\"बेतिनी र लम्पटे सिमसारको संरक्षण\"]',NULL,NULL,NULL);
/*!40000 ALTER TABLE `ideas` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `media`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `media` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `filename` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `original_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mime` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `size` bigint NOT NULL,
  `width` int DEFAULT NULL,
  `height` int DEFAULT NULL,
  `alt` text COLLATE utf8mb4_unicode_ci,
  `uploaded_by` int DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `media` WRITE;
/*!40000 ALTER TABLE `media` DISABLE KEYS */;
INSERT INTO `media` VALUES (1,'/uploads/documents/policy8384.pdf','policy8384.pdf','policy8384.pdf','application/pdf',663420,NULL,NULL,'Urlabari Municipality — Policy & Programme, FY 2083/84',NULL,'2026-10-04 09:02:38'),(2,'/uploads/documents/plan_vol1.pdf','plan_vol1.pdf','plan_vol1.pdf','application/pdf',4831235,NULL,NULL,'First Periodic Plan 2079/80–2083/84 — Main report & maps',NULL,'2026-10-04 09:02:38'),(3,'/uploads/documents/plan_vol2.pdf','plan_vol2.pdf','plan_vol2.pdf','application/pdf',1197650,NULL,NULL,'First Periodic Plan — Annexes',NULL,'2026-10-04 09:02:38'),(4,'/uploads/documents/plan_review.pdf','plan_review.pdf','plan_review.pdf','application/pdf',5988461,NULL,NULL,'Periodic plan review',NULL,'2026-10-04 09:02:38'),(5,'/uploads/documents/Urlabari-Campaign-Report.pdf','Urlabari-Campaign-Report.pdf','Urlabari-Campaign-Report.pdf','application/pdf',1021738,NULL,NULL,'Urlabari ward-by-ward facts report',NULL,'2026-10-04 09:02:38'),(8,'/uploads/2026/10/paisa-lDhKG_dh.jpg','paisa-lDhKG_dh.jpg','paisa.jpeg','image/jpeg',106600,2048,1542,NULL,1,'2026-10-04 11:27:16'),(9,'/uploads/2026/10/paisa-D3udc1PG.jpg','paisa-D3udc1PG.jpg','paisa.jpeg','image/jpeg',106600,2048,1542,NULL,1,'2026-10-04 11:33:13'),(10,'/uploads/2026/10/paisa-nJTzM5yy.jpg','paisa-nJTzM5yy.jpg','paisa.jpeg','image/jpeg',106600,2048,1542,NULL,1,'2026-10-04 11:41:35'),(11,'/uploads/2026/10/5a991a8f-d0d6-4802-a79c-418095906f5d-wMX4agTA.png','5a991a8f-d0d6-4802-a79c-418095906f5d-wMX4agTA.png','5a991a8f-d0d6-4802-a79c-418095906f5d.png','image/png',344137,770,774,NULL,1,'2026-10-05 09:08:15'),(12,'/uploads/2026/10/c2657821-cf3d-48dd-9cfd-a82037a46120-bjpUOcEp.jpg','c2657821-cf3d-48dd-9cfd-a82037a46120-bjpUOcEp.jpg','c2657821-cf3d-48dd-9cfd-a82037a46120.jpg','image/jpeg',896722,2480,3508,NULL,1,'2026-10-05 09:08:40'),(13,'/uploads/2026/10/5a991a8f-d0d6-4802-a79c-418095906f5d-1mFCKFOK.png','5a991a8f-d0d6-4802-a79c-418095906f5d-1mFCKFOK.png','5a991a8f-d0d6-4802-a79c-418095906f5d.png','image/png',344137,770,774,NULL,1,'2026-10-05 09:20:27'),(14,'/uploads/2026/10/image1-0X5ccmcu.jpg','image1-0X5ccmcu.jpg','image1.jpg','image/jpeg',19235,480,480,NULL,1,'2026-10-05 09:23:01'),(15,'/uploads/2026/10/image1-RBT7aCcE.jpg','image1-RBT7aCcE.jpg','image1.jpg','image/jpeg',19235,480,480,NULL,1,'2026-10-05 09:24:00'),(16,'/uploads/2026/10/image1-CvWcPKVA.jpg','image1-CvWcPKVA.jpg','image1.jpg','image/jpeg',19235,480,480,NULL,1,'2026-10-05 09:35:02'),(17,'/uploads/2026/10/image1-oBxq6tWo.jpg','image1-oBxq6tWo.jpg','image1.jpg','image/jpeg',19235,480,480,NULL,1,'2026-10-05 09:39:45'),(18,'/uploads/2026/10/image1-5mnIaoyD.jpg','image1-5mnIaoyD.jpg','image1.jpg','image/jpeg',19235,480,480,NULL,1,'2026-10-05 11:35:11'),(19,'/uploads/2026/10/image1-s7Hhu6_K.jpg','image1-s7Hhu6_K.jpg','image1.jpg','image/jpeg',19235,480,480,NULL,1,'2026-10-05 11:45:26'),(20,'/uploads/2026/10/image1-ZtPW9CWk.jpg','image1-ZtPW9CWk.jpg','image1.jpg','image/jpeg',19235,480,480,NULL,1,'2026-10-05 11:49:26'),(21,'/uploads/2026/10/image1-aBFog4VP.jpg','image1-aBFog4VP.jpg','image1.jpg','image/jpeg',19235,480,480,NULL,1,'2026-10-05 11:51:13'),(22,'/uploads/2026/10/urlabari-campaign-report-2wXj0K6w.pdf','urlabari-campaign-report-2wXj0K6w.pdf','Urlabari-Campaign-Report.pdf','application/pdf',1021738,NULL,NULL,NULL,1,'2026-10-05 11:52:49'),(23,'/uploads/2026/10/image1-k4vrxc8J.jpg','image1-k4vrxc8J.jpg','image1.jpg','image/jpeg',19235,480,480,NULL,1,'2026-10-05 12:02:59');
/*!40000 ALTER TABLE `media` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `published` tinyint(1) NOT NULL DEFAULT '1',
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` text COLLATE utf8mb4_unicode_ci,
  `name` text COLLATE utf8mb4_unicode_ci,
  `email` text COLLATE utf8mb4_unicode_ci,
  `phone` text COLLATE utf8mb4_unicode_ci,
  `subject` text COLLATE utf8mb4_unicode_ci,
  `message` mediumtext COLLATE utf8mb4_unicode_ci,
  `internal_note` mediumtext COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `messages_slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
INSERT INTO `messages` VALUES (1,NULL,1,0,'2026-10-05 11:34:16','2026-10-05 11:34:22','Read','raghav','raghavdahal686@gmail.com','9876543212','मलाक्षामा','fadsfjakdjfs fa fdjakdf',NULL);
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `posts` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `published` tinyint(1) NOT NULL DEFAULT '1',
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `title` text COLLATE utf8mb4_unicode_ci,
  `title_np` text COLLATE utf8mb4_unicode_ci,
  `type` text COLLATE utf8mb4_unicode_ci,
  `published_at` text COLLATE utf8mb4_unicode_ci,
  `excerpt` mediumtext COLLATE utf8mb4_unicode_ci,
  `excerpt_np` mediumtext COLLATE utf8mb4_unicode_ci,
  `body` mediumtext COLLATE utf8mb4_unicode_ci,
  `body_np` mediumtext COLLATE utf8mb4_unicode_ci,
  `cover` text COLLATE utf8mb4_unicode_ci,
  `source_name` text COLLATE utf8mb4_unicode_ci,
  `source_url` text COLLATE utf8mb4_unicode_ci,
  `attachment` text COLLATE utf8mb4_unicode_ci,
  `featured` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `posts_slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `posts` WRITE;
/*!40000 ALTER TABLE `posts` DISABLE KEYS */;
INSERT INTO `posts` VALUES (6,'post',1,0,'2026-10-05 11:49:40','2026-10-05 11:49:42',NULL,'उर्लाबारीकाे समस्या के हाे ?','News','2026-10-12',NULL,'fasdlka fadsjfa ',NULL,'fadjfklj. kdnfajl ','/uploads/2026/10/image1-ZtPW9CWk.jpg',NULL,NULL,NULL,1);
/*!40000 ALTER TABLE `posts` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `settings` (
  `key` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `settings` WRITE;
/*!40000 ALTER TABLE `settings` DISABLE KEYS */;
INSERT INTO `settings` VALUES ('site','{\"name\":\"Rudra Tamang\",\"name_np\":\"रुद्र तामाङ\",\"position\":\"Social Activist \",\"position_np\":\"समाजिक उर्लाबारी नगरपालिका\",\"party\":null,\"party_np\":null,\"constituency\":\"Urlabari, Morang\",\"constituency_np\":\"उर्लाबारी, मोरङ\",\"logo\":\"/uploads/2026/10/image1-aBFog4VP.jpg\",\"signature\":null,\"hero_kicker\":\"Urlabari · Morang · Koshi Province\",\"hero_kicker_np\":\"उर्लाबारी · मोरङ · कोशी प्रदेश\",\"hero_title\":\"A municipality that *answers* to its people.\",\"hero_title_np\":\"जनताप्रति *जवाफदेही* नगरपालिका।\",\"hero_text\":\"Every rupee published. Every ward heard. Every promise tracked in public — from the first day in office to the last.\",\"hero_text_np\":\"हरेक रुपैयाँ सार्वजनिक। हरेक वडाको आवाज सुनुवाइ। पहिलो दिनदेखि अन्तिम दिनसम्म हरेक प्रतिबद्धता खुला रूपमा ट्र्याक।\",\"hero_image\":\"/uploads/2026/10/image1-0X5ccmcu.jpg\",\"stats\":[{\"value\":\"9\",\"label\":\"wards, one plan\",\"label_np\":\"वडा, एउटै योजना\"},{\"value\":\"70,908\",\"label\":\"residents (Census 2078)\",\"label_np\":\"बासिन्दा (जनगणना २०७८)\"},{\"value\":\"66\",\"label\":\"schools to strengthen\",\"label_np\":\"विद्यालय सुदृढ गर्न\"},{\"value\":\"100%\",\"label\":\"spending published\",\"label_np\":\"खर्च सार्वजनिक\"}],\"message_title\":\"Why I am standing\",\"message_title_np\":\"काे हुन् रुद्र तामाङ्\",\"message_body\":\"Urlabari has grown by more than a quarter in a decade. Our roads, drains, schools and health posts have not kept pace, and too many of our young people now build other countries instead of their own.\\n\\nI am not asking for trust on promises alone. Everything I commit to on this site has a ward, a budget line and a date — and you will be able to check each one here, in public, while I am in office.\\n\\nCome to a ward meeting, file a grievance, read the documents. Hold me to it.\",\"message_body_np\":\"पछिल्लो दशकमा उर्लाबारीको जनसंख्या एक चौथाइभन्दा बढीले बढ्यो। तर हाम्रा सडक, ढल, विद्यालय र स्वास्थ्य चौकी त्यो गतिमा अघि बढेनन्, र हाम्रा धेरै युवा आज आफ्नो होइन, अर्काको देश बनाइरहेका छन्।\\n\\nम केवल वाचामा विश्वास माग्दिनँ। यस साइटमा मैले गरेको हरेक प्रतिबद्धताको वडा, बजेट शीर्षक र मिति छ — र पदमा रहँदा तपाईं यहीँ, सार्वजनिक रूपमा, प्रत्येक जाँच्न सक्नुहुनेछ।\\n\\nवडा भेलामा आउनुहोस्, गुनासो दर्ता गर्नुहोस्, कागजात पढ्नुहोस्। मलाई जवाफदेही बनाउनुहोस्।\",\"message_image\":\"/uploads/2026/10/image1-RBT7aCcE.jpg\",\"cta_title\":\"Urlabari is built by the people who show up.\",\"cta_title_np\":\"उर्लाबारी उपस्थित हुनेहरूले बनाउँछन्।\",\"cta_text\":\"Volunteer in your ward, bring a problem to our desk, or simply tell us what you think.\",\"cta_text_np\":\"आफ्नो वडामा स्वयंसेवक बन्नुहोस्, समस्या लिएर आउनुहोस्, वा आफ्नो विचार भन्नुहोस्।\",\"about_intro\":\"Born and raised in Urlabari, Rudra Tamang has spent nearly two decades in community organising, cooperative work and local government.\",\"about_intro_np\":\"उर्लाबारीमै जन्मिएका र हुर्किएका रुद्र तामाङले झन्डै दुई दशक सामुदायिक संगठन, सहकारी र स्थानीय सरकारमा बिताएका छन्।\",\"about_body\":\"*This biography is placeholder text. Replace it from Dashboard → Settings → About.*\\n\\nRudra Tamang grew up in a farming family in Urlabari. After completing his studies he returned home to work with farmers\' cooperatives, where he learned how much a village can do when its money and decisions stay close to home.\\n\\n## In public life\\n\\nHe has served as a ward-level representative, chaired a community forest user group and led relief coordination during the flood seasons along the Ratuwa and Bakraha rivers.\\n\\n## What he believes\\n\\nThat local government should be the most open government. That a citizen should never have to know someone to get something done. And that the measure of a term in office is what is still standing ten years later.\",\"about_body_np\":\"*यो जीवनी नमुना पाठ हो। ड्यासबोर्ड → सेटिङ → About बाट परिवर्तन गर्नुहोस्।*\\nके छ अाैाब पिबमवा बि बिमपाव ािपबमवाब\\n\\nरुद्र तामाङ उर्लाबारीको एक किसान परिवारमा हुर्किए। अध्ययनपछि उनी किसान सहकारीसँग काम गर्न घर फर्किए, जहाँ उनले गाउँको पैसा र निर्णय गाउँमै रहँदा कति धेरै गर्न सकिन्छ भन्ने सिके।\\n\\n## सार्वजनिक जीवनमा\\n\\nउनले वडा स्तरको प्रतिनिधिको रूपमा काम गरेका छन्, सामुदायिक वन उपभोक्ता समूहको अध्यक्षता गरेका छन् र रतुवा तथा बक्राहा खोलाको बाढीका बेला राहत समन्वयको नेतृत्व गरेका छन्।\\n\\n## उनको विश्वास\\n\\nस्थानीय सरकार सबैभन्दा खुला सरकार हुनुपर्छ। काम गराउन कुनै नागरिकले कसैलाई चिन्नु नपरोस्। र कार्यकालको मापन दस वर्षपछि पनि के उभिइरहेको छ भन्ने हो।\\n\\n## मेराे अनुभव\\nम एक बमापसब िपबमवा \",\"about_image\":null,\"born\":\"Urlabari, Morang\",\"born_np\":\"उर्लाबारी, मोरङ\",\"hometown\":\"Urlabari-7\",\"hometown_np\":\"उर्लाबारी-७\",\"education\":\"Master\'s in Rural Development\",\"education_np\":\"ग्रामीण विकासमा स्नातकोत्तर\",\"family\":\"Married, two children\",\"family_np\":\"विवाहित, दुई सन्तान\",\"manifesto_pdf\":null,\"transparency_intro\":\"Public money deserves public records. Asset declarations, budgets, audits and project reports are published here as soon as they exist — no request needed.\",\"transparency_intro_np\":\"सार्वजनिक पैसाको सार्वजनिक अभिलेख हुनुपर्छ। सम्पत्ति विवरण, बजेट, लेखापरीक्षण र आयोजना प्रतिवेदन तयार हुनासाथ यहाँ प्रकाशित गरिन्छ — माग गर्नु पर्दैन।\",\"transparency_pledge\":[\"Personal asset declaration published every year\",\"Every contract above Rs 5 lakh listed with its contractor\",\"Quarterly spending reports for every ward\",\"Public hearing in each ward twice a year\",\"Grievances answered within 15 days, tracked by code\"],\"transparency_pledge_np\":[\"हरेक वर्ष व्यक्तिगत सम्पत्ति विवरण सार्वजनिक\",\"५ लाखभन्दा माथिका सबै ठेक्का ठेकेदारसहित सूचीकृत\",\"हरेक वडाको त्रैमासिक खर्च प्रतिवेदन\",\"हरेक वडामा वर्षमा दुई पटक सार्वजनिक सुनुवाइ\",\"गुनासो १५ दिनभित्र जवाफ, कोडमार्फत ट्र्याक\"],\"email\":\"contact@rudratamang.com\",\"phone\":\"+977 9812345678\",\"address\":\"Urlabari-4, Aaitabare, Morang\",\"address_np\":\"उर्लाबारी-३ \",\"office_hours\":\"Sunday–Friday, 10:00–17:00\",\"office_hours_np\":\"आइतबार–शुक्रबार, १०:००–१७:००\",\"map_embed\":\"https://www.google.com/maps?q=Urlabari,Morang,Nepal&output=embed\",\"facebook\":\"https://www.facebook.com/rudrabahadur.tamang.370\",\"youtube\":\"https://youtube.com/\",\"instagram\":null,\"x\":null,\"tiktok\":\"https://www.tiktok.com/@rudrabahadurtam41\",\"seo_description\":\"Rudra Tamang — vision, record and public documents for Urlabari Municipality, Morang.\",\"seo_description_np\":\"रुद्र तामाङ — उर्लाबारी नगरपालिका, मोरङका लागि दृष्टिकोण, काम र सार्वजनिक कागजात।\",\"og_image\":null}','2026-10-14 02:59:18');
/*!40000 ALTER TABLE `settings` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `survey_responses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `survey_responses` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `survey_id` int unsigned NOT NULL,
  `answers` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `duration_sec` int DEFAULT NULL,
  `device_id` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ip_hash` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lang` varchar(5) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `survey_responses_survey` (`survey_id`,`id`),
  KEY `survey_responses_device` (`survey_id`,`device_id`),
  CONSTRAINT `survey_responses_fk` FOREIGN KEY (`survey_id`) REFERENCES `surveys` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `survey_responses` WRITE;
/*!40000 ALTER TABLE `survey_responses` DISABLE KEYS */;
/*!40000 ALTER TABLE `survey_responses` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `surveys`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `surveys` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `slug` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `questions` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `thank_you` text COLLATE utf8mb4_unicode_ci,
  `closes_at` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `one_per_device` tinyint(1) NOT NULL DEFAULT '0',
  `created_by` int DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `surveys` WRITE;
/*!40000 ALTER TABLE `surveys` DISABLE KEYS */;
INSERT INTO `surveys` VALUES (1,'untitled-survey','This is the college project','','[{\"id\":\"0vjz6vdu\",\"type\":\"single\",\"title\":\"How would your rate the municipality services?\",\"help\":\"\",\"required\":true,\"options\":[\"nicely\",\"estei\"],\"allowOther\":false,\"minLabel\":\"\",\"maxLabel\":\"\"}]','open','',NULL,0,1,'2026-10-14 01:51:49','2026-10-14 01:52:46');
/*!40000 ALTER TABLE `surveys` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `testimonials`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `testimonials` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `published` tinyint(1) NOT NULL DEFAULT '1',
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `name` text COLLATE utf8mb4_unicode_ci,
  `role` text COLLATE utf8mb4_unicode_ci,
  `role_np` text COLLATE utf8mb4_unicode_ci,
  `quote` mediumtext COLLATE utf8mb4_unicode_ci,
  `quote_np` mediumtext COLLATE utf8mb4_unicode_ci,
  `photo` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `testimonials_slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `testimonials` WRITE;
/*!40000 ALTER TABLE `testimonials` DISABLE KEYS */;
INSERT INTO `testimonials` VALUES (3,NULL,1,0,'2026-10-05 09:35:06','2026-10-05 09:35:06','रामेश्वर यादब',NULL,'किसान',NULL,'वहाले हामीलाइ धेरै सहयाेग गर्नुभएकाे छ ।','/uploads/2026/10/image1-CvWcPKVA.jpg');
/*!40000 ALTER TABLE `testimonials` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `timeline`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `timeline` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `published` tinyint(1) NOT NULL DEFAULT '1',
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `year` text COLLATE utf8mb4_unicode_ci,
  `title` text COLLATE utf8mb4_unicode_ci,
  `title_np` text COLLATE utf8mb4_unicode_ci,
  `description` mediumtext COLLATE utf8mb4_unicode_ci,
  `description_np` mediumtext COLLATE utf8mb4_unicode_ci,
  `image` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `timeline_slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `timeline` WRITE;
/*!40000 ALTER TABLE `timeline` DISABLE KEYS */;
INSERT INTO `timeline` VALUES (1,NULL,1,0,'2026-10-04 09:02:38','2026-10-04 09:02:38','1980s','Childhood in Urlabari','उर्लाबारीमा बाल्यकाल','Placeholder milestone — edit in Dashboard → Life & Journey.','नमुना — ड्यासबोर्डबाट सम्पादन गर्नुहोस्।',NULL),(2,NULL,1,1,'2026-10-04 09:02:38','2026-10-04 09:02:38','2063','Founded a farmers\' cooperative','किसान सहकारी स्थापना','Placeholder milestone.','नमुना।',NULL),(3,NULL,1,2,'2026-10-04 09:02:38','2026-10-04 09:02:38','2070','Chair, community forest user group','सामुदायिक वन उपभोक्ता समूहको अध्यक्ष','Placeholder milestone.','नमुना।',NULL),(4,NULL,1,3,'2026-10-04 09:02:38','2026-10-04 09:02:38','2074','Elected ward representative','वडा प्रतिनिधिमा निर्वाचित','Placeholder milestone.','नमुना।',NULL),(5,NULL,1,4,'2026-10-04 09:02:38','2026-10-04 09:02:38','2079','Flood relief coordinator','बाढी राहत संयोजक','Placeholder milestone.','नमुना।',NULL),(6,NULL,1,5,'2026-10-04 09:02:38','2026-10-04 09:02:38','2083','Candidate for Mayor','मेयर पदका उम्मेदवार','Placeholder milestone.','नमुना।',NULL);
/*!40000 ALTER TABLE `timeline` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'editor',
  `last_login_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Site Administrator','admin@rudratamang.com','$2b$12$4gihS6hFWebokU4CpfDq9.CILm16pdJmb/lMPBmRnmUhudnTFutIe','admin','2026-10-13 10:36:53','2026-10-04 09:02:38'),(2,'raghav','raghav@gmail.com','$2b$12$V7nnFUvEWos8mtZoHU7lR.hb0JhCfQ3ZT/KgExOp0wFbLM38OmEFa','editor','2026-10-05 11:43:30','2026-10-05 11:43:22');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `videos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `videos` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `published` tinyint(1) NOT NULL DEFAULT '1',
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `title` text COLLATE utf8mb4_unicode_ci,
  `title_np` text COLLATE utf8mb4_unicode_ci,
  `url` text COLLATE utf8mb4_unicode_ci,
  `thumbnail` text COLLATE utf8mb4_unicode_ci,
  `date` text COLLATE utf8mb4_unicode_ci,
  `description` mediumtext COLLATE utf8mb4_unicode_ci,
  `description_np` mediumtext COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `videos_slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `videos` WRITE;
/*!40000 ALTER TABLE `videos` DISABLE KEYS */;
INSERT INTO `videos` VALUES (2,NULL,1,0,'2026-10-05 11:38:02','2026-10-05 11:39:32',NULL,'मेराे भनाइ','https://www.facebook.com/FDC4k12/videos/1761266524920091',NULL,'2026-10-07',NULL,'ाबिपवमाव ि पिबमावबि '),(3,NULL,1,0,'2026-10-05 11:40:40','2026-10-05 12:02:03',NULL,'how it is','https://www.tiktok.com/@rudrabahadurtam41/video/7692982680748592405',NULL,'2026-10-08',NULL,'fkjladjfalfa asdfaf'),(4,NULL,1,0,'2026-10-05 12:00:14','2026-10-05 12:00:16',NULL,'मेराे भनाइ @af','https://www.facebook.com/rudrabahadur.tamang.370/videos/4269701216507794',NULL,'2026-10-04',NULL,'sometihng something');
/*!40000 ALTER TABLE `videos` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `volunteers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `volunteers` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `published` tinyint(1) NOT NULL DEFAULT '1',
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` text COLLATE utf8mb4_unicode_ci,
  `name` text COLLATE utf8mb4_unicode_ci,
  `phone` text COLLATE utf8mb4_unicode_ci,
  `email` text COLLATE utf8mb4_unicode_ci,
  `ward` text COLLATE utf8mb4_unicode_ci,
  `interests` text COLLATE utf8mb4_unicode_ci,
  `message` mediumtext COLLATE utf8mb4_unicode_ci,
  `internal_note` mediumtext COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `volunteers_slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `volunteers` WRITE;
/*!40000 ALTER TABLE `volunteers` DISABLE KEYS */;
INSERT INTO `volunteers` VALUES (2,NULL,1,0,'2026-10-05 11:42:08','2026-10-05 11:42:08','New','raghav','9876543212','reportedhub@gmail.com','2','Transport','fadfafda',NULL);
/*!40000 ALTER TABLE `volunteers` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `wards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wards` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `published` tinyint(1) NOT NULL DEFAULT '1',
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `number` double DEFAULT NULL,
  `name` text COLLATE utf8mb4_unicode_ci,
  `name_np` text COLLATE utf8mb4_unicode_ci,
  `population` double DEFAULT NULL,
  `households` double DEFAULT NULL,
  `area_km2` double DEFAULT NULL,
  `chair` text COLLATE utf8mb4_unicode_ci,
  `chair_np` text COLLATE utf8mb4_unicode_ci,
  `priorities` mediumtext COLLATE utf8mb4_unicode_ci,
  `priorities_np` mediumtext COLLATE utf8mb4_unicode_ci,
  `note` mediumtext COLLATE utf8mb4_unicode_ci,
  `note_np` mediumtext COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `wards_slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `wards` WRITE;
/*!40000 ALTER TABLE `wards` DISABLE KEYS */;
INSERT INTO `wards` VALUES (1,NULL,1,0,'2026-10-04 09:02:38','2026-10-04 09:02:38',1,'Madhumalla VDC wards 7–9','मधुमल्ला गाविस वडा ७–९',8804,2190,13.004,'Tilak Kumar Pandey',NULL,NULL,NULL,NULL,NULL),(2,NULL,1,1,'2026-10-04 09:02:38','2026-10-04 09:02:38',2,'Old Urlabari wards 7–9','साविक उर्लाबारी वडा ७–९',8413,2101,8.352,'Kumar Kadel',NULL,NULL,NULL,NULL,NULL),(3,NULL,1,2,'2026-10-04 09:02:38','2026-10-04 09:02:38',3,'Old Urlabari ward 6','साविक उर्लाबारी वडा ६',7302,1902,2.989,'Bhisma Raj Bhudhathoki',NULL,NULL,NULL,NULL,NULL),(4,NULL,1,3,'2026-10-04 09:02:38','2026-10-04 09:02:38',4,'Old Urlabari wards 1, 5','साविक उर्लाबारी वडा १, ५',9790,2448,8.684,'Kalyan Kumar Rai',NULL,NULL,NULL,NULL,NULL),(5,NULL,1,4,'2026-10-04 09:02:38','2026-10-04 09:02:38',5,'Old Urlabari ward 2','साविक उर्लाबारी वडा २',5535,1390,2.73,'Rabin Lama',NULL,NULL,NULL,NULL,NULL),(6,NULL,1,5,'2026-10-04 09:02:38','2026-10-04 09:02:38',6,'Old Urlabari ward 3','साविक उर्लाबारी वडा ३',5670,1440,2.55,'Chintamani Poudyal',NULL,NULL,NULL,NULL,NULL),(7,NULL,1,6,'2026-10-04 09:02:38','2026-10-04 09:02:38',7,'Old Urlabari ward 4','साविक उर्लाबारी वडा ४',10719,2600,2.829,'Urmila Thapa',NULL,NULL,NULL,NULL,NULL),(8,NULL,1,7,'2026-10-04 09:02:38','2026-10-05 12:03:50',8,'Rajghat VDC wards 1–4, 9','राजघाट गाविस वडा १–४, ९',7851,1955,20.393,'Kul Bahadur Karki',NULL,'[]','[\"किसान बिपमावब पबिवमाब\"]',NULL,NULL),(9,NULL,1,8,'2026-10-04 09:02:38','2026-10-04 09:02:38',9,'Rajghat VDC wards 5–8','राजघाट गाविस वडा ५–८',6824,1624,13.083,'Nar Bahadur Moktan',NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `wards` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

