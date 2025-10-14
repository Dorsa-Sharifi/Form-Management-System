import { useParams } from 'react-router-dom';
import React from 'react';

export function withParams<C>(Component: React.ComponentType<C & { params: Record<string, string> }>) {
  return (props: C) => {
    const rawParams = useParams();
    const params = Object.fromEntries(
      Object.entries(rawParams).map(([key, value]) => [key, value ?? ""])
    ) as Record<string, string>;
    return <Component {...props} params={params} />;
  };
}
