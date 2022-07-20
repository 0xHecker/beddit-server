import { Box, Button, Flex, Link } from "@chakra-ui/react";
import { FunctionComponent } from "react";
import NextLink from "next/link";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { isServer } from "../utils/isServer";
interface NavBarProps {}

const NavBar: FunctionComponent<NavBarProps> = ({}) => {
	const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
	const [{ data, fetching }] = useMeQuery({
		pause: isServer(),
	});

	let body = null;

	// if data is loading
	if (fetching) {
		body = null;
		// user not logged in
	} else if (!data?.me) {
		body = (
			<>
				<NextLink href={"/login"}>
					<Link color={"white"} fontWeight={700} mr={4}>
						login
					</Link>
				</NextLink>

				<NextLink href={"/register"}>
					<Link mr={4}>register</Link>
				</NextLink>
			</>
		);
		// user is logged in
	} else {
		body = (
			<Flex>
				<Box mr={2}>{data?.me?.username}</Box>
				<Button
					onClick={() => logout()}
					isLoading={logoutFetching}
					color={"white"}
					fontWeight={700}
					variant={"link"}
				>
					Logout
				</Button>
			</Flex>
		);
	}
	return (
		<Flex position={"sticky"} top={0} zIndex={1} bg="tomato" p={4}>
			<Box ml={"auto"}>{body}</Box>
		</Flex>
	);
};

export default NavBar;
