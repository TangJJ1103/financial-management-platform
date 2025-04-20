"use client";
import {
  AvatarGroup,
  Avatar,
  Tooltip,
  Box,
  Typography,
  useTheme,
} from "@mui/material";

/**
 * A component for displaying family member avatars
 *
 * @param {Object} props - Component props
 * @param {Array} props.members - List of family members to display
 * @param {number} props.max - Maximum number of avatars to show
 * @param {boolean} props.showNames - Whether to show names below avatars
 * @param {Object} props.sx - Additional styles
 */
const FamilyMemberAvatars = ({
  members = [],
  max = 4,
  showNames = false,
  sx = {},
}) => {
  const theme = useTheme();

  if (!members || members.length === 0) {
    return null;
  }

  return (
    <Box sx={{ ...sx }}>
      <AvatarGroup
        max={max}
        sx={{ justifyContent: showNames ? "center" : "flex-start" }}
      >
        {members.map((member) => (
          <Tooltip key={member.id} title={member.name}>
            <Avatar
              src={member.avatar}
              alt={member.name}
              sx={{
                width: 32,
                height: 32,
                border: `2px solid ${theme.palette.background.paper}`,
              }}
            />
          </Tooltip>
        ))}
      </AvatarGroup>

      {showNames && (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
            mt: 1,
            justifyContent: "center",
          }}
        >
          {members.slice(0, max).map((member) => (
            <Typography
              key={member.id}
              variant="caption"
              color="text.secondary"
            >
              {member.name}
            </Typography>
          ))}
          {members.length > max && (
            <Typography variant="caption" color="text.secondary">
              +{members.length - max} more
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default FamilyMemberAvatars;
