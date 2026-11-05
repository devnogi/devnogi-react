import { AxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";

import { createAuthServerAxios, createServerAxios } from "./server";

export async function proxyCommunityGet(request: NextRequest, path: string) {
  try {
    const axios = createServerAxios(request);
    const params = Object.fromEntries(new URL(request.url).searchParams);
    const { data, status } = await axios.get(path, { params });
    return NextResponse.json(data, { status });
  } catch (error) {
    return communityProxyError(error);
  }
}

export async function proxyCommunityMutation(
  request: NextRequest,
  path: string,
) {
  try {
    const axios = createAuthServerAxios(request);
    const { data, status } = await axios.request({
      method: request.method,
      url: path,
    });
    return status === 204
      ? new NextResponse(null, { status })
      : NextResponse.json(data, { status });
  } catch (error) {
    return communityProxyError(error);
  }
}

function communityProxyError(error: unknown) {
  if ((error as AxiosError).isAxiosError) {
    const axiosError = error as AxiosError;
    return NextResponse.json(
      axiosError.response?.data ?? { message: axiosError.message },
      { status: axiosError.response?.status ?? 500 },
    );
  }
  return NextResponse.json(
    { message: error instanceof Error ? error.message : "Unknown error" },
    { status: 500 },
  );
}
