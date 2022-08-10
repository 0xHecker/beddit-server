import { Box, Button, Flex, Text, Link } from "@chakra-ui/react";
import { FunctionComponent } from "react";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { isServer } from "../utils/isServer";
interface NavBarProps {}

const NavBar: FunctionComponent<NavBarProps> = ({}) => {
	const router = useRouter();
	const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
	const [{ data, fetching }] = useMeQuery();

	let body = null;

	// if data is loading
	if (fetching) {
		body = null;
		// user not logged in
	} else if (!data?.me) {
		body = (
			<Flex align={"center"}>
				<NextLink href={"/login"}>
					<Link color={"white"} fontWeight={700} mr={4}>
						login
					</Link>
				</NextLink>

				<NextLink href={"/register"}>
					<Link mr={4}>register</Link>
				</NextLink>
			</Flex>
		);
		// user is logged in
	} else {
		body = (
			<Flex align={"center"}>
				<Button mr={6}>
					<NextLink href={"/create-post"}>
						<Button as={Link} fontWeight={700} color={"red.600"} ml={"auto"}>
							Create Post
						</Button>
					</NextLink>
				</Button>
				<Box mr={2}>{data?.me?.username}</Box>
				<Button
					onClick={async () => {
						await logout();
						router.reload();
					}}
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
		<Flex
			position={"sticky"}
			top={0}
			zIndex={1}
			bg="tomato"
			p={4}
			align="center"
		>
			<Flex flex={1} m={"auto"} align={"center"} maxW={800}>
				<NextLink href={"/"}>
					<Link>
						<Text fontWeight={600} fontSize={20} color={"white"}>
							Beddit
						</Text>
					</Link>
				</NextLink>

				<Box ml={"auto"}>{body}</Box>
			</Flex>
		</Flex>
	);
};

export default NavBar;
