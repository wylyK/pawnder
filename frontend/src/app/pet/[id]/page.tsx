
// app/pet/[id]/page.tsx
"use client";

import { useParams } from "next/navigation";
import React from "react";
import PetProfile from "@/components/PetOverview/PetProfile";

const PetProfilePage: React.FC = () => {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id; // Ensure `id` is a string

  if (!id) return <div>Loading...</div>;

  return (
    <div>
      <PetProfile petId={id} />
    </div>
  );
};

export default PetProfilePage;
