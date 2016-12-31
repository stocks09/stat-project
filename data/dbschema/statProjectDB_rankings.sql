-- MySQL dump 10.13  Distrib 5.7.12, for osx10.9 (x86_64)
--
-- Host: localhost    Database: statProjectDB
-- ------------------------------------------------------
-- Server version	5.7.17

CREATE DATABASE statProjectDB;
 
USE statProjectDB;
--
-- Table structure for table `rankings`
--

DROP TABLE IF EXISTS `rankings`; 

CREATE TABLE `rankings` (
  `rdate` date DEFAULT NULL,
  `site` varchar(255) DEFAULT NULL,
  `keywords` varchar(255) DEFAULT NULL,
  `google` int(11) DEFAULT NULL,
  `google_base_rank` int(11) DEFAULT NULL,
  `yahoo` int(11) DEFAULT NULL,
  `bing` int(11) DEFAULT NULL,
  `global_monthly_searches` int(11) DEFAULT NULL,
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
 
 