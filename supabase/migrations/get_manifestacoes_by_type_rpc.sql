-- Create a function to get daily manifestation counts by type within a date range

CREATE OR REPLACE FUNCTION public.get_manifestacoes_by_type(
    start_date_param timestamptz,
    end_date_param timestamptz
)
RETURNS TABLE (
    tipo public.Enums.tipo_manifestacao,
    count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        m.tipo,
        COUNT(m.id) AS count
    FROM
        public.manifestacoes m
    WHERE
        m.created_at >= start_date_param AND m.created_at <= end_date_param
    GROUP BY
        m.tipo
    ORDER BY
        COUNT(m.id) DESC;
END;
$$;

-- Grant execution permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_manifestacoes_by_type(timestamptz, timestamptz) TO authenticated;