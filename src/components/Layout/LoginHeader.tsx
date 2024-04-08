import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

interface LinkDetail {
    href: string;
    name: string;
    target?: string;
}

const Links: LinkDetail[] = [
    {
        href: "/",
        name: "Home",
    },
    {
        href: "/nft",
        name: "NFTs",
    },
    {
        href: "https://bonkroyale.com/docs",
        name: "Docs",
        target: "_blank",
    },
    {
        href: "https://babybonk-shop.vercel.app/",
        name: "Shop",
        target: "_blank",
    },
];

export default function LoginHeader() {
    const [showMenu, setShowMenu] = useState<boolean>(false);

    const router = useRouter();

    useEffect(() => {
        setShowMenu(false);
    }, [router]);

    return (
        <div>
            <div className="block lg:hidden overflow-hidden w-full backdrop-blur-[20px] relative bg-[#ffffff07]">
                <div className="text-[white] no-underline text-[17px] px-4 py-3.5 flex justify-between place-items-center m-auto">
                    <Link href={"/"} className="parallelogramo">
                        <img src="/newassets/images/bonkroyale.png" />
                    </Link>
                    <div
                        className="skew-x-0 cursor-pointer"
                        onClick={() => setShowMenu(!showMenu)}
                    >
                        <img src="/newassets/images/mobilemenu.svg" width={30} />
                    </div>
                </div>
                {showMenu ? (
                    <div className="flex flex-col items-center">
                        {Links.map((val) => (
                            <Link {...val} key={val.name}>
                                <div className="text-white text-3xl hover:text-blue-500 my-6 flex justify-center">
                                    {val.name}
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : null}
            </div>
            <div className="hidden lg:flex relative w-full flex-row justify-between items-center px-4 md:px-12 xl:px-24 bg-[#00000009] backdrop-blur-xl shadow-[0px_10px_10px_#0000003d] mb-10 pl-[12%] pr-[10%] py-0">
                <div className="relative flex text-white items-center justify-between w-full h-full">
                    <div className="flex gap-1 items-center">
                        <div className="w-[180px] h-[84px] skew-x-[-20deg] backdrop-blur-[20px] border border-solid border-[#ff6101] bg-[#ff610136] hover:bg-[#FF6200] transition duration-300 ease-in-out relative flex items-center justify-center">
                            <Link href={"/"} className="skew-x-[20deg]">
                                <img
                                    src="/assets/images/bonkroyale.png"
                                    alt="bonkroyale"
                                    className="w-[50px] h-[120px] md:w-[100px] md:h-[55px] transform"
                                />
                            </Link>
                        </div>
                        <div className="hidden lg:flex gap-2 items-center">
                            {Links.map((val) => (
                                <Link
                                    className="w-[130px] h-[75px] transform skew-x-[-20deg] bg-opacity-5 bg-white flex items-center justify-center text-3xl transition duration-300 ease-in-out hover:bg-[#FF6200]"
                                    {...val}
                                    key={val.name}
                                >
                                    {val.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                    <div>
                        <w3m-button />
                    </div>
                </div>
            </div>
        </div>
    );
}
