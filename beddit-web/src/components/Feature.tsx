import { Box, Heading, Text } from "@chakra-ui/react";
import { title } from "process";
import React from "react";

type FeatureProps = {
	title: String;
	desc: String;
};

const Feature: React.FC<FeatureProps> = ({ title, desc }) => {
	return (
		<Box p={5} shadow="md" borderWidth="1px">
			<Heading fontSize="xl">{title}</Heading>
			<Text mt={4}>{desc}</Text>
		</Box>
	);
};

export default Feature;
