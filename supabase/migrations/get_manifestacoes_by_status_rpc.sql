-- Create a function to get daily manifestation counts by status within a date range

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