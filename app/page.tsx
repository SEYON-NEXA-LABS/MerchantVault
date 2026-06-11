import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default function Home() {
  async function dummyLogin(formData: FormData) {
    "use server";
    // Dev Dummy Login: Set a fake token and redirect
    const cookieStore = await cookies();
    cookieStore.set('sb-access-token', 'dev-dummy-token', { path: '/' });
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 p-8 bg-card rounded-xl border border-border shadow-sm">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-foreground">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            V Textile Company ERP Core
          </p>
        </div>
        <form action={dummyLogin} className="mt-8 space-y-6">
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="company" className="sr-only">Company Code</label>
              <input
                id="company"
                name="company"
                type="text"
                required
                defaultValue="vtex"
                className="relative block w-full rounded-md border-0 py-1.5 px-3 text-foreground ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:z-10 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                placeholder="Company Code (e.g. vtex)"
              />
            </div>
            <div>
              <label htmlFor="username" className="sr-only">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                required
                defaultValue="admin"
                className="relative block w-full rounded-md border-0 py-1.5 px-3 text-foreground ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:z-10 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                placeholder="Username"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                defaultValue="admin123"
                className="relative block w-full rounded-md border-0 py-1.5 px-3 text-foreground ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:z-10 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-primary px-3 py-1.5 text-sm font-semibold leading-6 text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
