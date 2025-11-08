-- Create a function to get daily manifestation counts within a date range

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