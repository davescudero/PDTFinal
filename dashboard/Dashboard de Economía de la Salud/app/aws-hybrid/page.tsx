import AWSHybridIntegration from '@/components/aws-hybrid-integration';

export default function AWSHybridPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Sistema Híbrido AWS + Local</h1>
        <p className="text-gray-600 mt-2">
          Integración real con servicios AWS disponibles y fallback local inteligente
        </p>
      </div>
      
      <AWSHybridIntegration />
    </div>
  );
} 