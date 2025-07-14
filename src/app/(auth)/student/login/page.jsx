import {  StudentLoginForm } from "@/components/auth/StudentLoginForm";
import diulogo from "../../../../../public/assets/logos/diulogos.png";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";

export default function StudentLogin() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-4">
      <div className="flex  items-center justify-center">
        <Image
          src={diulogo}
          alt="Diu Logo"
          width={250}
          height={150}
        />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-blue-900">
           Student Login
          </CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <StudentLoginForm />
      </Card>
    </div>
  );
}
