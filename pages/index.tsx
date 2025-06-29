import React, { Suspense } from "react";
import Head from 'next/head';
import dynamic from "next/dynamic";
const DynamicMain = dynamic(() => import('../src/main'), {
  ssr: false,
  loading: () => <div style={{ padding: "20px", fontSize: "20px" }}>Loading...</div>
})

export default function IndexPage() {
  return <DynamicMain />;
}
