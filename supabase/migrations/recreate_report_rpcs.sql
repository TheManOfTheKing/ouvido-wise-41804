-- Drop existing functions to ensure a clean slate and consistent signatures
DROP FUNCTION IF EXISTS public.get_manifestacoes_by_type(timestamptz, timestamptz);
DROP FUNCTION IF EXISTS public.get_manifestacoes_by_status(timestamptz, timestamptz);
-- Drop old signatures for get_manifestacoes_by_day if they exist
DROP FUNCTION IF EXISTS public.get_manifestacoes_by_day(date, date);
DROP FUNCTION IF EXISTS public.get_manifestacoes_by_day(timestamptz, timestamptz);

-- Recreate get_manifestacoes_by_type function
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

-- Recreate get_manifestacoes_by_status function
CREATE OR REPLACE FUNCTION public.get_manifestacoes_by_status(
    start_date_param timestamptz,
    end_date_param timestamptz
)
RETURNS TABLE (
    status public.Enums.status_manifestacao,
    count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        m.status,
        COUNT(m.id) AS count
    FROM
        public.manifestacoes m
    WHERE
        m.created_at >= start_date_param AND m.created_at <= end_date_param
    GROUP BY
        m.status
    ORDER BY
        COUNT(m.id) DESC;
END;
$$;

-- Grant execution permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_manifestacoes_by_status(timestamptz, timestamptz) TO authenticated;

-- Recreate get_manifestacoes_by_day function
CREATE OR REPLACE FUNCTION public.get_manifestacoes_by_day(
    start_date_param timestamptz,
    end_date_param timestamptz
)
RETURNS TABLE (
    date date,
    count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        DATE(m.created_at) AS date,
        COUNT(m.id) AS count
    FROM
        public.manifestacoes m
    WHERE
        m.created_at >= start_date_param AND m.created_at <= end_date_param
    GROUP BY
        DATE(m.created_at)
    ORDER BY
        DATE(m.created_at);
END;
$$;

-- Grant execution permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_manifestacoes_by_day(timestamptz, timestamptz) TO authenticated;