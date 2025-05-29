use r3sp1ra770ri4x8025
;


with 
urgencias_egreso as (
	SELECT 
		FJ2FFYB9BIF59_id id_registro_urg, 
		FJ2FFYB9BIF59_FFF1YJ7I fecha_recepcion_urg, -- fecha de recepcion
		FJ2FFYB9BIF59_Y7FJ7BFBB59 fecha_egreso_urg, -- fecha de egreso urgencias
		FJ2FFYB9BIF59_F1I5Y2F7B2B5 motivo_alta_urg, -- motivo de alta 
		FJ2FFYB9BIF59_J1Y9I71JJJF expediente_urg, -- expediente
		FJ2FFYB9BIF59_Y7FY7YF1B nse_urg, -- NSE
		FJ2FFYB9BIF59_FJIF72FYYI no_de_cam_urg,  -- No. de cama
		FJ2FFYB9BIF59_L191B225Y7Y hospitalizado_urg
	from th5_FJ2FFYB9BIF59 -- Registro inicial de pacientes de urgencias
	where 1 
		and YEAR(FJ2FFYB9BIF59_Y7FJ7BFBB59)=2025
		and MONTH(FJ2FFYB9BIF59_Y7FJ7BFBB59)=1
		and (
			( 	FJ2FFYB9BIF59_FJIF72FYYI IS NOT NULL	 
				and FJ2FFYB9BIF59_F1I5Y2F7B2B5 <> 'HOSPITALIZACIÓN'
			) or (
				FJ2FFYB9BIF59_FJIF72FYYI IS NULL
				and FJ2FFYB9BIF59_F1I5Y2F7B2B5 = 'DEFUNCIÓN'
			)
		)
),
urgencias as (
	SELECT 
		FJ2FFYB9BIF59_id id_registro_urg, 
		FJ2FFYB9BIF59_FFF1YJ7I fecha_recepcion_urg, -- fecha de recepcion
		FJ2FFYB9BIF59_Y7FJ7BFBB59 fecha_egreso_urg, -- fecha de egreso urgencias
		FJ2FFYB9BIF59_F1I5Y2F7B2B5 motivo_alta_urg, -- motivo de alta 
		FJ2FFYB9BIF59_J1Y9I71JJJF expediente_urg, -- expediente
		FJ2FFYB9BIF59_Y7FY7YF1B nse_urg, -- NSE
		FJ2FFYB9BIF59_FJIF72FYYI no_de_cam_urg,  -- No. de cama
		FJ2FFYB9BIF59_L191B225Y7Y hospitalizado_urg
	from th5_FJ2FFYB9BIF59 -- Registro inicial de pacientes de urgencias
	where 1 
	
),
hospitalizacion as (
	SELECT 
		FYF7Y9IB2I2II_id id_registro_admision, 
		FYF7Y9IB2I2II_Y7FY7YF1B fecha_recepcion_hosp, -- fecha de recepcion adm,mision
		FYF7Y9IB2I2II_JFIFIJJ1YBY fecha_egreso_hosp, -- fecha de egreso hospi
		FYF7Y9IB2I2II_L171F2295BBI5 motivo_alta_hosp, -- motivo de alta 
		FYF292FI2JII5_F2FF91IBY n_expediente_hosp, -- numero expediente
		FYF292FI2JII5_L52JBIY7JBB59 ian_expediente_hosp, -- IAN expediente
		FYF7Y9IB2I2II_L11FBFF9YY nse_hosp, -- NSE
		FYF7Y9IB2I2II_FFF1YJ7I no_de_cama_hosp,  -- No. de cama
		FYF7Y9IB2I2II_I52F2F727FJF estancia_hosp, -- estancia
		FYF7Y9IB2I2II_L5JF77Y5J5F1B -- procedencia
	from th5_FYF7Y9IB2I2II -- Registro ADMISIO
	join th5_FYF292FI2JII5 
		on FYF7Y9IB2I2II_BB9F7I25 = FYF292FI2JII5_id
	where YEAR(FYF7Y9IB2I2II_JFIFIJJ1YBY)=2025
		and MONTH(FYF7Y9IB2I2II_JFIFIJJ1YBY)=1
		and 
		 (	
		 	(FYF7Y9IB2I2II_I52F2F727FJF='Hospitalizado')
		 	or(
		 		FYF7Y9IB2I2II_I52F2F727FJF = 'Ambulatorio' -- Estancia
		 		and FYF7Y9IB2I2II_L171F2295BBI5 = 'DEFUNCIÓN' -- Motivo de alta
		 		and FYF7Y9IB2I2II_YF592JIB9JF = 'SERVICIO CLÍNICO 9' -- Servicio clínico asignado
		 	)
		 )
),
todo_junto as (
	select ue.*, h.* from urgencias_egreso ue
	 left join hospitalizacion h
	 	on (ue.expediente_urg = h.n_expediente_hosp
	 		or ue.expediente_urg = h.ian_expediente_hosp)
	union
	 select u.*, h.* from urgencias u
	 right join hospitalizacion h
	 	on (u.expediente_urg = h.n_expediente_hosp
	 		or u.expediente_urg = h.ian_expediente_hosp)
	 	   and (
	 	  	DATE_FORMAT(fecha_egreso_urg, '%Y%m%d') = DATE_FORMAT(fecha_recepcion_hosp, '%Y%m%d')
	 	  	or (
	 	  		DATEDIFF(fecha_egreso_urg, fecha_recepcion_hosp) >= -1
	 	  		and DATEDIFF(fecha_egreso_urg, fecha_recepcion_hosp) <= 1
	 	  	)
	 	  )
 )

-- Laboratorios
select 
	-- th5_BIF2YFBI2BF59.*
	BIF2YFBI2BF59_L191B225Y7Y paciente, -- paciente,
	BIF2YFBI2BF59_L9BI1I9BYII fecha, -- fecha,
	1 cantidad, -- cantidad,
	BIF2YFBI2BF59_L11FBFF9YY clave, -- clave,
	BIF2YFBI2BF59_F5997JB9F descripcion, -- descripcion,
	BIF2YFBI2BF59_L5Y2YBJ2Y5 area_servicio, -- enviado a 
	BIF2YFBI2BF59_L1BB51FJ9I5 nivel, -- nivel,
	FYIJFJ59B511B_FIY2I51175 costo_nivel_6, -- costo_nivel_6 (catalogo servicios),
	FYIJFJ59B511B_L11FBFF9YY monto_nivel_1, -- monto_nivel_1 (catalogo servicios),
	FYIJFJ59B511B_FIY2I51175 monto_nivel_6-- monto_nivel_6 (catalogo servicios),
from th5_BIF2YFBI2BF59 -- (946) Estudios Solicitados
left join th5_FYIJFJ59B511B  -- Solicitud Estudios Laboratorio
	on BIF2YFBI2BF59_FIY2I51175 = FYIJFJ59B511B_id
left join todo_junto
	on (BIF2YFBI2BF59_FJ2FFFB5B5F = id_registro_urg
		or BIF2YFBI2BF59_B2IJ29792I = id_registro_admision)
where 
	YEAR(BIF2YFBI2BF59_L9BI1I9BYII) = 2025
	and MONTH(BIF2YFBI2BF59_L9BI1I9BYII) = 1
	and (BIF2YFBI2BF59_FJ2FFFB5B5F in ( -- registro urgencias
			select id_registro_urg  from todo_junto
		)
	or BIF2YFBI2BF59_B2IJ29792I in ( -- registro admision
			select id_registro_admision  from todo_junto
		)
	)

 union
 
 -- Cargo de hospitalización
select 
	FYF7Y9IB2I2II_BB9F7I25 paciente, -- paciente (admision)
	L7J9BI77712B92I_F5997JB9F fecha, -- fecha,
	L7J9BI77712B92I_Y7FY7YF1B cantidad, -- cantidad,
	L7J9BI77712B92I_FFF1YJ7I clave, -- clave,
	L7J9BI77712B92I_B2129FIJF descripcion, -- descripcion,
	COALESCE(IF(FYIJFJ59B511B_Y55BJBBYBFYY IS NULL or FYIJFJ59B511B_Y55BJBBYBFYY = '', NULL, FYIJFJ59B511B_Y55BJBBYBFYY), FYIJFJ59B511B_Y1IIJBBJF97I) area_servicio, -- tipo (catalogo sevicios)
	L7J9BI77712B92I_BB9F7I25 nivel, -- nivel,
	FYIJFJ59B511B_FIY2I51175 costo_nivel_6, -- costo_nivel_6 (catalogo servicios),
	FYIJFJ59B511B_L11FBFF9YY * L7J9BI77712B92I_Y7FY7YF1B monto_nivel_1 , -- monto_nivel_1 (catalogo servicios),
	FYIJFJ59B511B_FIY2I51175 * L7J9BI77712B92I_Y7FY7YF1B monto_nivel_6 -- monto_nivel_6 (catalogo servicios),
from th5_L7J9BI77712B92I
left join th5_FYF7Y9IB2I2II -- admision (268)
	on L7J9BI77712B92I_YY2191I51F = FYF7Y9IB2I2II_id
left join th5_FYIJFJ59B511B  -- Catalogo de servicios 859
	on L7J9BI77712B92I_Y1JYJIJ11B = FYIJFJ59B511B_id
where L7J9BI77712B92I_YY2191I51F in (
	select id_registro_admision from todo_junto
)

union
-- Cargo de urgencias
select 
 
 	FJ2FFYB9BIF59_F2FF91IBY paciente, -- paciente (admision)
	L55JY2I21Y917II_FIY2I51175 fecha, -- fecha,
	L55JY2I21Y917II_F2FF91IBY cantidad, -- cantidad,
	L55JY2I21Y917II_F5997JB9F clave, -- clave,
	L55JY2I21Y917II_Y7FY7YF1B descripcion, -- descripcion,
	COALESCE(IF(FYIJFJ59B511B_Y55BJBBYBFYY IS NULL or FYIJFJ59B511B_Y55BJBBYBFYY = '', NULL, FYIJFJ59B511B_Y55BJBBYBFYY), FYIJFJ59B511B_Y1IIJBBJF97I) area_servicio, -- tipo (catalogo sevicios)
	L55JY2I21Y917II_FFY1BJ5I59 nivel, -- nivel,
	FYIJFJ59B511B_FIY2I51175 costo_nivel_6, -- costo_nivel_6 (catalogo servicios),
	FYIJFJ59B511B_L11FBFF9YY * L55JY2I21Y917II_F2FF91IBY monto_nivel_1 , -- monto_nivel_1 (catalogo servicios),
	FYIJFJ59B511B_FIY2I51175 * L55JY2I21Y917II_F2FF91IBY monto_nivel_6 -- monto_nivel_6 (catalogo servicios),
from th5_L55JY2I21Y917II
left join th5_FJ2FFYB9BIF59 -- Registro Inicial de Pacientes (Urgencias) (50)
	on L55JY2I21Y917II_FFF1YJ7I = FJ2FFYB9BIF59_id
left join th5_FYIJFJ59B511B  -- Catalogo de servicios 859
	on L55JY2I21Y917II_BB9F7I25 = FYIJFJ59B511B_id
where L55JY2I21Y917II_FFF1YJ7I in (
	select id_registro_urg from todo_junto
)

; 