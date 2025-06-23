using Controle_de_Reuniões.Data;
using Controle_de_Reuniões.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Controle_de_Reuniões.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReservaController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ReservaController(AppDbContext context)
        {
            _context = context;
        }

        // DTOs para evitar ciclos de referência
        public class ReservaDto
        {
            public int Id { get; set; }
            public string SalaId { get; set; } = string.Empty;
            public string Responsavel { get; set; } = string.Empty;
            public string Gerencia { get; set; } = string.Empty;
            public DateTime DataInicio { get; set; }
            public DateTime DataFim { get; set; }
            public string? Assunto { get; set; }
            public string? Observacoes { get; set; }
            public DateTime DataCriacao { get; set; }
            public bool Cancelada { get; set; }
            public string SalaNome { get; set; } = string.Empty;
            public string SalaSetor { get; set; } = string.Empty;
        }

        // GET: api/reserva
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ReservaDto>>> GetReservas()
        {
            try
            {
                Console.WriteLine("Iniciando busca de reservas...");
                
                var reservas = await _context.Reservas
                    .Include(r => r.Sala)
                    .Where(r => !r.Cancelada)
                    .OrderBy(r => r.DataInicio)
                    .ToListAsync();
                
                Console.WriteLine($"Encontradas {reservas.Count} reservas");
                
                // Converter para DTOs para evitar ciclos de referência
                var reservasDto = reservas.Select(r => new ReservaDto
                {
                    Id = r.Id,
                    SalaId = r.SalaId,
                    Responsavel = r.Responsavel,
                    Gerencia = r.Gerencia,
                    DataInicio = r.DataInicio,
                    DataFim = r.DataFim,
                    Assunto = r.Assunto,
                    Observacoes = r.Observacoes,
                    DataCriacao = r.DataCriacao,
                    Cancelada = r.Cancelada,
                    SalaNome = r.Sala?.Nome ?? string.Empty,
                    SalaSetor = r.Sala?.Setor.ToString() ?? string.Empty
                }).ToList();
                
                return reservasDto;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao buscar reservas: {ex.Message}");
                Console.WriteLine($"StackTrace: {ex.StackTrace}");
                return StatusCode(500, $"Erro interno do servidor: {ex.Message}");
            }
        }

        // GET: api/reserva/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ReservaDto>> GetReserva(int id)
        {
            var reserva = await _context.Reservas
                .Include(r => r.Sala)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (reserva == null)
            {
                return NotFound();
            }

            // Converter para DTO
            var reservaDto = new ReservaDto
            {
                Id = reserva.Id,
                SalaId = reserva.SalaId,
                Responsavel = reserva.Responsavel,
                Gerencia = reserva.Gerencia,
                DataInicio = reserva.DataInicio,
                DataFim = reserva.DataFim,
                Assunto = reserva.Assunto,
                Observacoes = reserva.Observacoes,
                DataCriacao = reserva.DataCriacao,
                Cancelada = reserva.Cancelada,
                SalaNome = reserva.Sala?.Nome ?? string.Empty,
                SalaSetor = reserva.Sala?.Setor.ToString() ?? string.Empty
            };

            return reservaDto;
        }

        // GET: api/reserva/sala/{salaId}
        [HttpGet("sala/{salaId}")]
        public async Task<ActionResult<IEnumerable<ReservaDto>>> GetReservasPorSala(string salaId)
        {
            var reservas = await _context.Reservas
                .Include(r => r.Sala)
                .Where(r => r.SalaId == salaId && !r.Cancelada)
                .OrderBy(r => r.DataInicio)
                .ToListAsync();

            // Converter para DTOs
            var reservasDto = reservas.Select(r => new ReservaDto
            {
                Id = r.Id,
                SalaId = r.SalaId,
                Responsavel = r.Responsavel,
                Gerencia = r.Gerencia,
                DataInicio = r.DataInicio,
                DataFim = r.DataFim,
                Assunto = r.Assunto,
                Observacoes = r.Observacoes,
                DataCriacao = r.DataCriacao,
                Cancelada = r.Cancelada,
                SalaNome = r.Sala?.Nome ?? string.Empty,
                SalaSetor = r.Sala?.Setor.ToString() ?? string.Empty
            }).ToList();

            return reservasDto;
        }

        // GET: api/reserva/disponibilidade/{salaId}?data=2024-01-15
        [HttpGet("disponibilidade/{salaId}")]
        public async Task<ActionResult<object>> VerificarDisponibilidade(string salaId, [FromQuery] DateTime data)
        {
            // Verificar se a sala existe
            var sala = await _context.Salas.FindAsync(salaId);
            if (sala == null)
            {
                return NotFound("Sala não encontrada");
            }

            // Verificar se é dia útil (segunda a sexta)
            if (data.DayOfWeek == DayOfWeek.Saturday || data.DayOfWeek == DayOfWeek.Sunday)
            {
                return BadRequest("Agendamentos apenas de segunda a sexta-feira");
            }

            // Horário de funcionamento: 07:30 às 17:15
            var inicioDia = data.Date.AddHours(7).AddMinutes(30);
            var fimDia = data.Date.AddHours(17).AddMinutes(15);

            // Buscar reservas do dia para esta sala
            var reservasDoDia = await _context.Reservas
                .Where(r => r.SalaId == salaId && 
                           !r.Cancelada &&
                           r.DataInicio.Date == data.Date)
                .OrderBy(r => r.DataInicio)
                .ToListAsync();

            // Gerar horários disponíveis (intervalos de 15 minutos para mais opções)
            var horariosDisponiveis = new List<object>();
            var horarioAtual = inicioDia;

            while (horarioAtual < fimDia)
            {
                var horarioFim = horarioAtual.AddMinutes(15);
                
                // Verificar se este horário está disponível
                var conflito = reservasDoDia.Any(r => 
                    (r.DataInicio < horarioFim && r.DataFim > horarioAtual));

                if (!conflito)
                {
                    horariosDisponiveis.Add(new
                    {
                        Inicio = horarioAtual.ToString("HH:mm"),
                        Fim = horarioFim.ToString("HH:mm"),
                        Disponivel = true
                    });
                }
                else
                {
                    var reservaConflito = reservasDoDia.First(r => 
                        (r.DataInicio < horarioFim && r.DataFim > horarioAtual));
                    
                    horariosDisponiveis.Add(new
                    {
                        Inicio = horarioAtual.ToString("HH:mm"),
                        Fim = horarioFim.ToString("HH:mm"),
                        Disponivel = false,
                        ReservadoPor = reservaConflito.Responsavel,
                        Assunto = reservaConflito.Assunto
                    });
                }

                horarioAtual = horarioFim;
            }

            return new
            {
                Sala = sala.Nome,
                Data = data.ToString("dd/MM/yyyy"),
                HorariosDisponiveis = horariosDisponiveis
            };
        }

        // POST: api/reserva
        [HttpPost]
        public async Task<ActionResult<ReservaDto>> CriarReserva(Reserva reserva)
        {
            // Validações básicas
            if (reserva.DataInicio >= reserva.DataFim)
            {
                return BadRequest("Data de início deve ser anterior à data de fim");
            }

            if (reserva.DataInicio < DateTime.Now)
            {
                return BadRequest("Não é possível agendar para datas passadas");
            }

            // Verificar se é dia útil
            if (reserva.DataInicio.DayOfWeek == DayOfWeek.Saturday || 
                reserva.DataInicio.DayOfWeek == DayOfWeek.Sunday)
            {
                return BadRequest("Agendamentos apenas de segunda a sexta-feira");
            }

            // Verificar horário de funcionamento
            var horaInicio = reserva.DataInicio.TimeOfDay;
            var horaFim = reserva.DataFim.TimeOfDay;
            var funcionamentoInicio = TimeSpan.FromHours(7).Add(TimeSpan.FromMinutes(30));
            var funcionamentoFim = TimeSpan.FromHours(17).Add(TimeSpan.FromMinutes(15));

            if (horaInicio < funcionamentoInicio || horaFim > funcionamentoFim)
            {
                return BadRequest("Horário fora do período de funcionamento (07:30 às 17:15)");
            }

            // Verificar se a sala existe
            var sala = await _context.Salas.FindAsync(reserva.SalaId);
            if (sala == null)
            {
                return NotFound("Sala não encontrada");
            }

            // Verificar conflitos de horário
            var conflitos = await _context.Reservas
                .Where(r => r.SalaId == reserva.SalaId && 
                           !r.Cancelada &&
                           r.DataInicio.Date == reserva.DataInicio.Date &&
                           r.DataInicio < reserva.DataFim && 
                           r.DataFim > reserva.DataInicio)
                .ToListAsync();

            if (conflitos.Any())
            {
                return BadRequest("Já existe uma reserva para este horário");
            }

            // Criar a reserva
            reserva.DataCriacao = DateTime.Now;
            _context.Reservas.Add(reserva);
            await _context.SaveChangesAsync();

            // Retornar a reserva criada com os dados da sala
            await _context.Entry(reserva).Reference(r => r.Sala).LoadAsync();

            // Converter para DTO
            var reservaDto = new ReservaDto
            {
                Id = reserva.Id,
                SalaId = reserva.SalaId,
                Responsavel = reserva.Responsavel,
                Gerencia = reserva.Gerencia,
                DataInicio = reserva.DataInicio,
                DataFim = reserva.DataFim,
                Assunto = reserva.Assunto,
                Observacoes = reserva.Observacoes,
                DataCriacao = reserva.DataCriacao,
                Cancelada = reserva.Cancelada,
                SalaNome = reserva.Sala?.Nome ?? string.Empty,
                SalaSetor = reserva.Sala?.Setor.ToString() ?? string.Empty
            };

            return CreatedAtAction(nameof(GetReserva), new { id = reserva.Id }, reservaDto);
        }

        // PUT: api/reserva/5
        [HttpPut("{id}")]
        public async Task<IActionResult> AtualizarReserva(int id, Reserva reserva)
        {
            if (id != reserva.Id)
            {
                return BadRequest();
            }

            var reservaExistente = await _context.Reservas.FindAsync(id);
            if (reservaExistente == null)
            {
                return NotFound();
            }

            // Atualizar apenas campos permitidos
            reservaExistente.Responsavel = reserva.Responsavel;
            reservaExistente.Gerencia = reserva.Gerencia;
            reservaExistente.Assunto = reserva.Assunto;
            reservaExistente.Observacoes = reserva.Observacoes;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Reservas.Any(e => e.Id == id))
                    return NotFound();
                else
                    throw;
            }

            return NoContent();
        }

        // DELETE: api/reserva/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> CancelarReserva(int id)
        {
            var reserva = await _context.Reservas.FindAsync(id);
            if (reserva == null)
            {
                return NotFound();
            }

            // Marcar como cancelada ao invés de deletar
            reserva.Cancelada = true;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/reserva/test
        [HttpGet("test")]
        public async Task<ActionResult<object>> TestDatabase()
        {
            try
            {
                Console.WriteLine("Testando conexão com banco de dados...");
                
                // Verificar se a tabela de reservas existe
                var reservasCount = await _context.Reservas.CountAsync();
                var salasCount = await _context.Salas.CountAsync();
                
                Console.WriteLine($"Tabela Reservas: {reservasCount} registros");
                Console.WriteLine($"Tabela Salas: {salasCount} registros");
                
                return new
                {
                    Message = "Conexão com banco OK",
                    ReservasCount = reservasCount,
                    SalasCount = salasCount,
                    Timestamp = DateTime.Now
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro no teste do banco: {ex.Message}");
                return StatusCode(500, $"Erro no banco: {ex.Message}");
            }
        }
    }
} 