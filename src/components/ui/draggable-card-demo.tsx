import React from "react";
import {
  DraggableCardBody,
  DraggableCardContainer,
} from "@/components/ui/draggable-card";

export default function DraggableCardDemo() {
  const items = [
    {
      title: "Tyler Durden",
      image:
        "https://cdn.21st.dev/assets/mirror/5b/5bd047accda6563413c453afc2e6539276979d17ab03681fa8ccd9d28c718329.jpg",
      className: "absolute top-10 left-[20%] rotate-[-5deg]",
    },
    {
      title: "The Narrator",
      image:
        "https://cdn.21st.dev/assets/mirror/f8/f8794d304174ce2e25dc108cfa2e9218bafd42b19f75095cf05c097f83de17d1.jpg",
      className: "absolute top-40 left-[25%] rotate-[-7deg]",
    },
    {
      title: "Iceland",
      image:
        "https://cdn.21st.dev/assets/mirror/b9/b9758631c2f432150c01acd330ff34a3815498008365d0b7d543eae06f572e7a.jpg",
      className: "absolute top-5 left-[40%] rotate-[8deg]",
    },
    {
      title: "Japan",
      image:
        "https://cdn.21st.dev/assets/mirror/7a/7a5853bb64a6358d781cc3ab06ec45fd7be42d583aa9a164b4d457afc3adebff.jpg",
      className: "absolute top-32 left-[55%] rotate-[10deg]",
    },
    {
      title: "Norway",
      image:
        "https://cdn.21st.dev/assets/mirror/7a/7a5ea12125f49c170585725135e2d1f1a816c71a29f149feb0469396ed7cddef.jpg",
      className: "absolute top-20 right-[35%] rotate-[2deg]",
    },
    {
      title: "New Zealand",
      image:
        "https://cdn.21st.dev/assets/mirror/77/773e007a928155eaec093cec79f4cd2adb718b6fb50b5b5469623d8b1492b076.jpg",
      className: "absolute top-24 left-[45%] rotate-[-7deg]",
    },
    {
      title: "Canada",
      image:
        "https://cdn.21st.dev/assets/mirror/2b/2bd4aa1d9cb47e18df5b4a03427b142910fa911259a7ec729227c0f656e27e0c.jpg",
      className: "absolute top-8 left-[30%] rotate-[4deg]",
    },
  ];
  return (
    <DraggableCardContainer className="relative flex min-h-screen w-full items-center justify-center overflow-clip">
      <p className="absolute top-1/2 mx-auto max-w-sm -translate-y-3/4 text-center text-2xl font-black text-neutral-400 md:text-4xl dark:text-neutral-800">
        If its your first day at Fight Club, you have to fight.
      </p>
      {items.map((item, idx) => (
        <DraggableCardBody key={idx} className={item.className}>
          <img
            src={item.image}
            alt={item.title}
            className="pointer-events-none relative z-10 h-80 w-80 object-cover"
          />
          <h3 className="mt-4 text-center text-2xl font-bold text-neutral-700 dark:text-neutral-300">
            {item.title}
          </h3>
        </DraggableCardBody>
      ))}
    </DraggableCardContainer>
  );
}
