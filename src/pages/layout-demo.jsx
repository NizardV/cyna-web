import { Layout } from "@/components/layout/layout";

export function LayoutDemo() {
  return (
    <div className="space-y-4 bg-white p-4">
      <h1 className="text-3xl font-bold mb-8">Layout Variations Demo</h1>

      <section className="border-2 border-blue-500 rounded-lg overflow-hidden">
        <div className="bg-blue-100 p-2 font-semibold text-blue-900">1. Full Layout (All Elements Visible)</div>
        <Layout>
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Full Page Example</h2>
            <p className="text-gray-600">This is the default layout with all elements visible.</p>
          </div>
        </Layout>
      </section>

      <section className="border-2 border-green-500 rounded-lg overflow-hidden">
        <div className="bg-green-100 p-2 font-semibold text-green-900">2. Auth Layout (Minimal - Hide Search, Nav, User Section)</div>
        <Layout hideSearch hideNav hideUserSection>
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Login/Register Page</h2>
            <p className="text-gray-600">Minimal header with logo only.</p>
          </div>
        </Layout>
      </section>

      <section className="border-2 border-purple-500 rounded-lg overflow-hidden">
        <div className="bg-purple-100 p-2 font-semibold text-purple-900">3. Product Page (Full Header, Minimal Footer)</div>
        <Layout hideDescription hideInfoSection hideLegalSection hideSocial>
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Product Page</h2>
            <p className="text-gray-600">Full header with search and navigation.</p>
          </div>
        </Layout>
      </section>

      <section className="border-2 border-orange-500 rounded-lg overflow-hidden">
        <div className="bg-orange-100 p-2 font-semibold text-orange-900">4. Account Page (Full Layout)</div>
        <Layout>
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Account/Orders Page</h2>
            <p className="text-gray-600">Full header and footer visible.</p>
          </div>
        </Layout>
      </section>
    </div>
  );
}
