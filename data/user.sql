DROP TABLE IF EXISTS `user`

CREATE TABLE `data`.`user` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`));
  INSERT INTO `data`.`user` (`id`, `name`, `email`, `password`) VALUES ('1', 'ply', 'ply@ply.ply', 'ply');