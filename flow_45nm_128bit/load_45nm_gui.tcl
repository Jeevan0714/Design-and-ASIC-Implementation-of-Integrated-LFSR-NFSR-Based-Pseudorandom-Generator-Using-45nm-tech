# ==============================================================================
# OpenROAD GUI Loader Script for NanGate 45nm Layout
# ==============================================================================

# 1. Read NanGate 45nm PDK Libraries
read_lef /home/jeevan/vlsi_libraries/nangate45/NangateOpenCellLibrary.tech.lef
read_lef /home/jeevan/vlsi_libraries/nangate45/NangateOpenCellLibrary.lef
read_liberty /home/jeevan/vlsi_libraries/nangate45/NangateOpenCellLibrary_typical.lib

# 2. Read Routed DEF File
read_def flow_45nm_128bit/results/lfsr_nfsr_top_45nm.def

puts "========================================================="
puts "  NanGate 45nm Layout Loaded Successfully into OpenROAD! "
puts "========================================================="
