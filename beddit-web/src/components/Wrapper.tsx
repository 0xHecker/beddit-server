import { Box } from "@chakra-ui/react";

export type WrapperVariant = "small" | "regular";

interface WrapperProps {
	variant?: WrapperVariant;
	children: any;
}

export const Wrapper: React.FC<WrapperProps> = ({
	children,
	variant: varient = "regular",
}) => {
	return (
		<Box
			mt={8}
			mx="auto"
			maxW={varient === "regular" ? "800px" : "400px"}
			w="100%"
		>
			{children}
		</Box>
	);
};
