import { DashboardLayout } from "@/components/dashboard-layout"
import { AreasPage } from "@/components/areas-page"
import AWSIntegration from "@/components/aws-integration"

export default function AreasAWS() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Tu página original de áreas */}
        <AreasPage />
        
        {/* Integración AWS agregada */}
        <div className="border-t pt-6">
          <h3 className="text-xl font-semibold mb-4">🚀 Análisis Avanzado con AWS</h3>
          <AWSIntegration 
            data={[]} // Los datos se cargarán desde la página de áreas
            selectedService="URGENCIAS"
            selectedAlcaldia="IZTAPALAPA"
          />
        </div>
      </div>
    </DashboardLayout>
  )
} 