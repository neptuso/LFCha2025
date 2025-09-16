import argparse
import os
import sys

# Añadir el directorio actual al path para asegurar que los módulos internos se encuentren
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.sync_service import run_final_sync

def main():
    """
    Interfaz de línea de comandos para ejecutar la sincronización de la base de datos.
    Permite especificar un reportTemplateID para la sincronización de zonas.
    """
    parser = argparse.ArgumentParser(
        description="Ejecuta el proceso de sincronización con la API de COMET.",
        formatter_class=argparse.RawTextHelpFormatter
    )

    parser.add_argument(
        "--report-id",
        type=int,
        default=3315314,
        help='''El ID del \'reportTemplateID\' para la sincronización de Zonas.
- ID por defecto (actual): 3315540
- ID alternativo (propuesto): 3315314
'''
    )

    args = parser.parse_args()

    print(f"\n--- INICIANDO SCRIPT DE SINCRONIZACIÓN ---")
    print(f"ID de Reporte de Zonas seleccionado: {args.report_id}")
    print("-----------------------------------------")
    
    try:
        run_final_sync(zones_report_id=args.report_id)
        print("\n--- SCRIPT DE SINCRONIZACIÓN FINALIZADO ---")
    except Exception as e:
        print(f"\n--- ❌ OCURRIÓ UN ERROR INESPERADO DURANTE LA EJECUCIÓN ---")
        print(f"{e}")
        print("----------------------------------------------------------")

if __name__ == "__main__":
    main()
