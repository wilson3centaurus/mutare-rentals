"use client";

import dynamic from "next/dynamic";

const ModelComparison = dynamic(() => import("./ModelComparison"), { ssr: false });
const SuburbTrends = dynamic(() => import("./SuburbTrends"), { ssr: false });

export default function DynamicSections() {
  return (
    <>
      <ModelComparison />
      <SuburbTrends />
    </>
  );
}
