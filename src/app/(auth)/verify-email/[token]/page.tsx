/* eslint-disable @next/next/no-async-client-component */
import VerifyEmailContent from "./VerifyEmailContent";
interface Props {
  params: Promise<{ token: string }>;
}
export default async function VerifyEmail({ params }: Props) {
  const { token } = await params;
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Verification Page.
        </h2>
        <VerifyEmailContent token={token} />
      </div>
    </div>
  );
}
