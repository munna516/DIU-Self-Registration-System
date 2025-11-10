import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { email, password, role } = credentials;
        // Check if email and password are provided
        if (!email || !password || !role) {
          return null;
        }

        try {
          if (role === "student") {
            const res = await fetch(
              `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/student/login`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
              }
            );
            if (
              res.status === 401 ||
              res.status === 402 ||
              res.status === 404
            ) {
              return null;
            }
            const data = await res.json();
            return data;
          } else if (role === "teacher") {
            const res = await fetch(
              `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/teacher/loginTeacher`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
              }
            );
            if (
              res.status === 401 ||
              res.status === 402 ||
              res.status === 404
            ) {
              return null;
            }
            const data = await res.json();
            return data;
          } else if (role === "admin") {
            const res = await fetch(
              `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/admin/adminlogin`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
              }
            );
            if (
              res.status === 401 ||
              res.status === 402 ||
              res.status === 404
            ) {
              return null;
            }
            const data = await res.json();
            return data;
          }
        } catch (error) {
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        if (user.student?.role === "student") {
          token.id = user?.student._id;
          token.email = user?.student.email;
          token.name = user?.student.name;
          token.studentId = user?.student.studentId;
          token.department = user?.student.department;
          token.role = user?.student.role;
        } else if (user.teacher?.role === "teacher") {
          token.id = user?.teacher._id;
          token.email = user?.teacher.email;
          token.name = user?.teacher.name;
          token.phone = user?.teacher.phone;
          token.teacherId = user?.teacher.teacherId;
          token.department = user?.teacher.department;
          token.designation = user?.teacher.designation;
          token.role = user?.teacher.role;
        } else if (user.admin?.role === "admin") {
          token.id = user?.admin._id;
          token.email = user?.admin.email;
          token.role = user?.admin.role;
        }
      }

      return token;
    },
    // Attach the custom data from the JWT token to the session
    async session({ session, token }) {
      if (token) {
        session.user.id = token?.id;
        session.user.email = token?.email;
        session.user.name = token?.name;
        session.user.phone = token?.phone;
        session.user.studentId = token?.studentId;
        session.user.teacherId = token?.teacherId;
        session.user.department = token?.department;
        session.user.designation = token.designation;
        session.user.role = token.role;
      }
      return session;
    },
    async signIn({ user, account }) {
      if (account.provider === "credentials") {
        return true;
      }
      return false;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
